// Builds a .vcf (vCard) file from a list of contacts.
export function buildVcf(contacts: { fullName: string; phone: string; email: string | null; organization: string | null }[]) {
  return contacts
    .map((c) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${c.fullName}`,
        `N:${c.fullName};;;`,
        `TEL;TYPE=CELL,VOICE:${c.phone}`,
      ];
      if (c.email) lines.push(`EMAIL:${c.email}`);
      if (c.organization) lines.push(`ORG:${c.organization}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    })
    .join("\r\n");
}
