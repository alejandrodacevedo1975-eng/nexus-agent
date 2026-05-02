// Slides service using pptxgenjs loaded dynamically
export async function generatePresentation(topic: string, content: string): Promise<Blob> {
  // Load pptxgenjs from CDN dynamically
  if (!(window as any).PptxGenJS) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load pptxgenjs'));
      document.head.appendChild(script);
    });
  }

  const PptxGenJS = (window as any).PptxGenJS;
  const pptx = new PptxGenJS();

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0F172A' };
  titleSlide.addText(topic, {
    x: 0.5, y: 1.5, w: 9, h: 1.5,
    fontSize: 36, bold: true, color: 'FFFFFF', align: 'center'
  });
  titleSlide.addText('Generado por NEXUS-AGENT', {
    x: 0.5, y: 3.5, w: 9, h: 0.5,
    fontSize: 16, color: '64B5F6', align: 'center'
  });

  // Content slides
  const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
  const chunkSize = 5;
  
  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const chunk = paragraphs.slice(i, i + chunkSize);
    const slide = pptx.addSlide();
    slide.background = { color: '0F172A' };
    
    slide.addText(`${topic} - Parte ${Math.floor(i / chunkSize) + 1}`, {
      x: 0.5, y: 0.3, w: 9, h: 0.6,
      fontSize: 20, bold: true, color: '64B5F6'
    });

    chunk.forEach((para, idx) => {
      slide.addText(`• ${para.replace(/\*\*/g, '').trim()}`, {
        x: 0.5, y: 1.2 + idx * 0.9, w: 9, h: 0.8,
        fontSize: 14, color: 'E2E8F0', wrap: true
      });
    });
  }

  const blob = await pptx.write({ outputType: 'blob' });
  return blob as Blob;
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
