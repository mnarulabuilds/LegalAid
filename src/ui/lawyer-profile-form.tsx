"use client";

import { CASE_CATEGORIES } from "@/domain/catalog";

export function LawyerProfileForm() {
  async function action(formData: FormData) {
    await fetch("/api/lawyers/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barNumber: formData.get("barNumber"),
        firmName: formData.get("firmName"),
        bio: formData.get("bio"),
        specialties: formData.get("specialties"),
        yearsExperience: Number(formData.get("yearsExperience")),
        hourlyRateUsd: Number(formData.get("hourlyRateUsd")),
        languagesSpoken: formData.get("languagesSpoken"),
        jurisdictions: formData.get("jurisdictions"),
      }),
    });
  }

  return (
    <form action={action} className="panel rounded-2xl p-6 grid gap-3 md:grid-cols-2">
      <h2 className="display text-2xl md:col-span-2">Your chambers profile</h2>
      <input name="barNumber" placeholder="Bar number" required className="rounded-md border border-[#14110b]/15 px-3 py-2" />
      <input name="firmName" placeholder="Firm" className="rounded-md border border-[#14110b]/15 px-3 py-2" />
      <input name="specialties" placeholder={`Specialties comma-separated (${CASE_CATEGORIES[0]},…)`} required className="rounded-md border border-[#14110b]/15 px-3 py-2 md:col-span-2" />
      <textarea name="bio" placeholder="Bio" required className="rounded-md border border-[#14110b]/15 px-3 py-2 md:col-span-2" />
      <input name="yearsExperience" type="number" placeholder="Years" className="rounded-md border border-[#14110b]/15 px-3 py-2" />
      <input name="hourlyRateUsd" type="number" placeholder="Hourly USD" className="rounded-md border border-[#14110b]/15 px-3 py-2" />
      <input name="languagesSpoken" placeholder="en,hi" className="rounded-md border border-[#14110b]/15 px-3 py-2" />
      <input name="jurisdictions" placeholder="IN,GB" className="rounded-md border border-[#14110b]/15 px-3 py-2" />
      <button className="rounded-full bg-[#14110b] px-5 py-2 text-[#f3ead7] md:col-span-2">Save profile</button>
    </form>
  );
}
