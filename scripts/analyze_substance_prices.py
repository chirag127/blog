import csv
import re

# List of substances from the 50-part series
substances = [
    "Codeine", "Tramadol", "Tapentadol", "Morphine", "Fentanyl", "Buprenorphine", "Methadone",
    "Alprazolam", "Diazepam", "Clonazepam", "Lorazepam", "Nitrazepam", "Midazolam", "Chlordiazepoxide", "Clobazam",
    "Zolpidem", "Zopiclone", "Eszopiclone",
    "Phenobarbital", "Phenobarbitone", "Pentobarbital",
    "Pregabalin", "Gabapentin",
    "Carisoprodol", "Baclofen", "Tizanidine", "Chlorzoxazone",
    "Methylphenidate", "Modafinil", "Pseudoephedrine", "Sibutramine",
    "Ketamine", "Dextromethorphan", "Nitrous Oxide",
    "Promethazine", "Diphenhydramine", "Chlorpheniramine", "Hydroxyzine",
    "Trihexyphenidyl", "Atropine", "Scopolamine",
    "Amitriptyline", "Quetiapine", "Bupropion",
    "Nandrolone", "Testosterone", "Stanozolol", "Clenbuterol",
    "Toluene", "Alkyl Nitrites", "Cannabis", "Bhang"
]

with open('scripts/rate.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    data = list(reader)

found_drugs = []

for row in data:
    generic_name = row['Generic Name'].lower()
    for s in substances:
        # Match substance name as a whole word in the generic name
        if re.search(rf'\b{re.escape(s.lower())}\b', generic_name):
            try:
                mrp = float(row['MRP'])
                if mrp <= 0: continue
                
                unit_size = row['Unit Size']
                per_unit = mrp
                unit_type = "unit"
                
                # Calculate price per tablet if possible
                if "'s" in unit_size:
                    count = int(re.search(r'(\d+)', unit_size).group(1))
                    per_unit = mrp / count
                    unit_type = "tablet/capsule"
                elif "ml" in unit_size.lower():
                    vol_match = re.search(r'(\d+)', unit_size)
                    if vol_match:
                        vol = int(vol_match.group(1))
                        per_unit = mrp / vol
                        unit_type = "ml"
                
                found_drugs.append({
                    "Substance": s,
                    "Full Name": row['Generic Name'],
                    "MRP": mrp,
                    "Unit": unit_size,
                    "Price_Per_Unit": per_unit,
                    "Unit_Type": unit_type
                })
                break # Move to next drug row once matched
            except:
                continue

# Sort by price per unit (tablet/ml)
sorted_drugs = sorted(found_drugs, key=lambda x: x['Price_Per_Unit'])

print(f"{'Substance':<15} | {'Price/Unit':<12} | {'MRP':<8} | {'Unit Size':<15} | {'Full Name'}")
print("-" * 100)

for d in sorted_drugs:
    print(f"{d['Substance']:<15} | Rs {d['Price_Per_Unit']:>8.2f} | Rs {d['MRP']:>6} | {d['Unit']:<15} | {d['Full Name']}")

# Save to a dedicated file as requested
with open('scripts/substance_price_ranking.txt', 'w', encoding='utf-8') as out:
    out.write("Substance Price Ranking (Sorted by Price per Tablet/ML/Unit)\n")
    out.write("=" * 100 + "\n")
    out.write(f"{'Substance':<15} | {'Price/Unit':<12} | {'MRP':<8} | {'Unit Size':<15} | {'Full Name'}\n")
    out.write("-" * 100 + "\n")
    for d in sorted_drugs:
        out.write(f"{d['Substance']:<15} | Rs {d['Price_Per_Unit']:>8.4f} | Rs {d['MRP']:>6} | {d['Unit']:<15} | {d['Full Name']}\n")

print(f"\nTotal unique entries found: {len(found_drugs)}")
print("Full list saved to scripts/substance_price_ranking.txt")
