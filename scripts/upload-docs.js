const { createClient } = require('@supabase/supabase-js');
const { PDFDocument, rgb } = require('pdf-lib');

const supabaseUrl = process.env.SUPABASE_URL || process.argv[2];
const supabaseKey = process.env.SUPABASE_KEY || process.argv[3];

if (!supabaseUrl || !supabaseKey) {
  console.log('Usage: node upload-docs.js <SUPABASE_URL> <SUPABASE_KEY>');
  console.log('Or set SUPABASE_URL and SUPABASE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const { data: docs } = await supabase.from('documents').select('id, slug, title_fr, subject, year');
  if (!docs || docs.length === 0) { console.log('No docs found'); return; }

  for (const doc of docs) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont('Helvetica');

    const title = doc.title_fr || doc.slug;
    const subject = doc.subject || 'General';
    const year = doc.year || 'N/A';

    page.drawText(title, { x: 50, y: 750, size: 20, font });
    page.drawText('Subject: ' + subject, { x: 50, y: 700, size: 14, font });
    page.drawText('Year: ' + String(year), { x: 50, y: 670, size: 14, font });
    page.drawText('ConcoursMaroc - Sample Document', { x: 50, y: 600, size: 12, font, color: rgb(0.5, 0.5, 0.5) });
    page.drawText('This is a preview document for demonstration.', { x: 50, y: 570, size: 11, font });
    page.drawText('Upload your real PDF files via the admin panel.', { x: 50, y: 550, size: 11, font });

    const pdfBytes = await pdfDoc.save();

    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(doc.slug + '.pdf', pdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadErr) {
      console.log('Upload error:', doc.slug, uploadErr.message);
    } else {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.slug + '.pdf');
      await supabase.from('documents').update({ file_url: urlData.publicUrl }).eq('id', doc.id);
      console.log('OK:', doc.slug);
    }
  }
  console.log('Done!');
})();
