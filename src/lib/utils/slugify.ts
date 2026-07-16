export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function generateConcoursSlug(
  institution: string,
  category: string,
  year: number
): string {
  const inst = slugify(institution);
  const cat = slugify(category);
  return `${inst}-${cat}-${year}`;
}
