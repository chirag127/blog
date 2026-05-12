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
        # Match substance name
        if re.search(rf'\b{re.escape(s.lower())}\b', generic_name):
            try:
                mrp = float(row['MRP'])
                if mrp <= 0: continue
                
                found_drugs.append({
                    "Substance": s,
                    "Full Name": row['Generic Name'],
                    "Pack Size": row['Unit Size'],
                    "MRP": mrp
                })
                break
            except:
                continue

# Sort by raw MRP (cheapest pack first)
sorted_drugs = sorted(found_drugs, key=lambda x: x['MRP'])

print(f"{'Substance':<15} | {'MRP':<8} | {'Pack Size':<15} | {'Full Name'}")
print("-" * 110)

for d in sorted_drugs:
    print(f"{d['Substance']:<15} | Rs {d['MRP']:>6} | {d['Pack Size']:<15} | {d['Full Name']}")

# Save to file
with open('scripts/substance_mrp_only.txt', 'w', encoding='utf-8') as out:
    out.write("Substance MRP List (Raw Package Prices - Not Divided by Unit)\n")
    out.write("=" * 110 + "\n")
    out.write(f"{'Substance':<15} | {'MRP':<8} | {'Pack Size':<15} | {'Full Name'}\n")
    out.write("-" * 110 + "\n")
    for d in sorted_drugs:
        out.write(f"{d['Substance']:<15} | Rs {d['MRP']:>6} | {d['Pack Size']:<15} | {d['Full Name']}\n")

print(f"\nTotal entries: {len(found_drugs)}")
print("List saved to scripts/substance_mrp_only.txt")
