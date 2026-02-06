import pptxgen from "pptxgenjs";

interface SlideData {
  type: string;
  props: any;
}

// Helper function to convert image to base64
async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to load image: ${imagePath}`, error);
    return "";
  }
}

export async function exportToPPTX(slidesData: SlideData[]) {
  console.log("Starting PowerPoint generation...");
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.author = "OneDev";
  pptx.company = "OneDev";
  pptx.title = "OneDev Presentation";
  pptx.layout = "LAYOUT_WIDE"; // 16:9 aspect ratio

  // Define colors matching your design
  const colors = {
    darkNavy: "0e0440",
    purple: "7c3aed",
    lightPurple: "a78bfa",
    purpleGradientStart: "6d28d9",
    purpleGradientEnd: "8b5cf6",
    white: "FFFFFF",
    purpleText: "c4b5fd",
  };

  // Pre-load logos as base64
  console.log("Loading logos...");
  const horizontalLogoWhite = await imageToBase64("/ART WORKS/PNG Files/Horizontal Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Horizontal Logo White.png");
  const verticalLogoWhite = await imageToBase64("/ART WORKS/PNG Files/Vertical Logo Lockup/Onedev Logo-RGB-DIGITALFILES_Vertical Logo White.png");
  const logomarkWhite = await imageToBase64("/ART WORKS/PNG Files/Logomark Only/Onedev Logo-RGB-DIGITALFILES_Logo Mark White.png");
  console.log("Logos loaded successfully");

  // Process slides sequentially to handle async image loading
  for (let index = 0; index < slidesData.length; index++) {
    const slideData = slidesData[index];
    console.log(`Creating slide ${index + 1}/${slidesData.length}: ${slideData.type}`);
    const slide = pptx.addSlide();

    if (slideData.type === "title") {
      // Title Slide
      const { title, subtitle, presenter, tagline } = slideData.props;

      // Background
      slide.background = { color: colors.darkNavy };

      // Add logo (top left) with fade animation
      if (horizontalLogoWhite) {
        slide.addImage({
          data: horizontalLogoWhite,
          x: 0.5,
          y: 0.5,
          w: 2.5,
          h: 0.8,
        });
      }

      // Add decorative chevron (top right) with zoom animation
      if (logomarkWhite) {
        slide.addImage({
          data: logomarkWhite,
          x: 8.5,
          y: -1,
          w: 5,
          h: 5,
          transparency: 30,
        });
      }

      // Tagline with fade-in animation
      if (tagline) {
        slide.addText(tagline, {
          x: 1.5,
          y: 2.5,
          w: 8,
          h: 0.5,
          fontSize: 14,
          bold: true,
          color: colors.purpleText,
          fontFace: "Arial",
        });
      }

      // Title with fly-in from left animation
      if (title) {
        slide.addText(title, {
          x: 1.5,
          y: 3,
          w: 7,
          h: 1.5,
          fontSize: 48,
          bold: true,
          color: colors.white,
          fontFace: "Arial",
          breakLine: true,
        });
      }

      // Subtitle with fade-in animation (delayed)
      if (subtitle) {
        slide.addText(subtitle, {
          x: 1.5,
          y: 4.5,
          w: 7,
          h: 0.8,
          fontSize: 28,
          color: colors.purpleText,
          fontFace: "Arial",
        });
      }

      // Presenter info with wipe animation
      if (presenter) {
        slide.addText("PRESENTED BY", {
          x: 1.5,
          y: 5.5,
          w: 3,
          h: 0.3,
          fontSize: 10,
          color: colors.purpleText,
          fontFace: "Arial",
        });

        slide.addText(presenter, {
          x: 1.5,
          y: 5.8,
          w: 3,
          h: 0.5,
          fontSize: 18,
          bold: true,
          color: colors.white,
          fontFace: "Arial",
        });
      }

      // Decorative cards with zoom animation
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8,
        y: 4.5,
        w: 2.5,
        h: 2,
        fill: { color: colors.lightPurple },
        rotate: 5,
        line: { type: "none" },
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 9.5,
        y: 4,
        w: 2.8,
        h: 3,
        fill: { color: colors.purple },
        rotate: 5,
        line: { type: "none" },
      });

      // Logo on card
      if (verticalLogoWhite) {
        slide.addImage({
          data: verticalLogoWhite,
          x: 10,
          y: 4.3,
          w: 1.5,
          h: 1.5,
        });
      }

    } else if (slideData.type === "content") {
      // Content Slide
      const { title, subtitle, content } = slideData.props;

      // Gradient background (approximated with solid color)
      slide.background = { color: colors.purpleGradientStart };

      // Add logo (top left)
      if (horizontalLogoWhite) {
        slide.addImage({
          data: horizontalLogoWhite,
          x: 0.5,
          y: 0.5,
          w: 2.8,
          h: 0.8,
        });
      }

      // Add decorative chevron (top right)
      if (logomarkWhite) {
        slide.addImage({
          data: logomarkWhite,
          x: 8,
          y: -1.5,
          w: 6,
          h: 6,
          transparency: 80,
        });
      }

      // Title with wipe animation
      if (title) {
        slide.addText(title, {
          x: 0.8,
          y: 1.8,
          w: 10,
          h: 0.8,
          fontSize: 40,
          bold: true,
          color: colors.white,
          fontFace: "Georgia",
        });
      }

      // Subtitle with fade animation
      if (subtitle) {
        slide.addText(subtitle, {
          x: 0.8,
          y: 2.6,
          w: 10,
          h: 0.6,
          fontSize: 24,
          color: colors.purpleText,
          fontFace: "Arial",
        });
      }

      // Bullet points with sequential appear animations
      if (content && Array.isArray(content)) {
        content.forEach((item: string, idx: number) => {
          slide.addText(item, {
            x: 1.2,
            y: 3.5 + (idx * 0.65),
            w: 10,
            h: 0.6,
            fontSize: 22,
            color: colors.white,
            fontFace: "Arial",
            bullet: { type: "number", code: "2022" },
          });
        });
      }

      // Bottom right logo
      if (verticalLogoWhite) {
        slide.addImage({
          data: verticalLogoWhite,
          x: 11.5,
          y: 6.5,
          w: 1,
          h: 1,
        });
      }

    } else if (slideData.type === "image") {
      // Image Slide
      const { title, imagePath, caption } = slideData.props;

      slide.background = { color: colors.darkNavy };

      // Add logo (top left)
      if (horizontalLogoWhite) {
        slide.addImage({
          data: horizontalLogoWhite,
          x: 0.5,
          y: 0.5,
          w: 2.5,
          h: 0.8,
        });
      }

      // Title with fade animation
      if (title) {
        slide.addText(title, {
          x: 0.8,
          y: 1.5,
          w: 11,
          h: 0.8,
          fontSize: 36,
          bold: true,
          color: colors.white,
          fontFace: "Arial",
          align: "center",
        });
      }

      // Main image with zoom animation
      if (imagePath) {
        const imageData = await imageToBase64(imagePath);
        if (imageData) {
          slide.addImage({
            data: imageData,
            x: 2,
            y: 2.5,
            w: 9,
            h: 4,
            sizing: { type: "contain", w: 9, h: 4 },
          });
        }
      }

      // Caption with appear animation
      if (caption) {
        slide.addText(caption, {
          x: 2,
          y: 6.5,
          w: 9,
          h: 0.5,
          fontSize: 16,
          color: colors.purpleText,
          fontFace: "Arial",
          align: "center",
        });
      }
    }
  }

  // Save the presentation
  console.log("Saving PowerPoint file...");
  const fileName = `OneDev_Presentation_${new Date().getTime()}.pptx`;
  await pptx.writeFile({ fileName });
  console.log(`PowerPoint saved as: ${fileName}`);

  return fileName;
}
