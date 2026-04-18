import { NextResponse } from 'next/server';
// @ts-ignore
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

export const maxDuration = 30; // Max execution time for Serverless Functions

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
    
    let text = '';

    if (fileType === 'application/pdf' || fileType === 'pdf') {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'docx' || fileType === 'doc') {
      const { value } = await mammoth.extractRawText({ buffer });
      text = value;
    } else if (fileType === 'application/json' || fileType === 'json') {
      const jsonStr = buffer.toString('utf-8');
      try {
        const parsed = JSON.parse(jsonStr);
        text = JSON.stringify(parsed, null, 2);
      } catch(e) {
        text = jsonStr;
      }
    } else if (fileType === 'text/plain' || fileType === 'txt' || fileType === 'md' || fileType === 'csv') {
      text = buffer.toString('utf-8');
    } else if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(fileType as string)) {
      // Very basic robust OCR for raw images
      const { data } = await Tesseract.recognize(buffer, 'eng');
      text = data.text;
      if (!text || !text.trim()) {
        return NextResponse.json({ error: 'Failed to extract text from the image.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF, Word Doc, Image, JSON, TXT, or MD file.' }, { status: 400 });
    }

    // Clean up excessive whitespace/newlines to save token context
    text = text.replace(/\n\s*\n/g, '\n\n').trim();

    return NextResponse.json({ text, filename: file.name });
  } catch (error: any) {
    console.error("[Parse Doc API Error]", error);
    return NextResponse.json({ error: error.message || 'Failed to parse document' }, { status: 500 });
  }
}
