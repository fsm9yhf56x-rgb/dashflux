#!/bin/bash
cd /Users/alonguez/dashflux

# Méthodologie
sed -i '' 's/className="p-8"/className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12"/g' app/methodologie/page.tsx
sed -i '' 's/className="text-4xl/className="text-2xl sm:text-3xl lg:text-4xl/g' app/methodologie/page.tsx
sed -i '' 's/className="text-2xl/className="text-xl sm:text-2xl lg:text-3xl/g' app/methodologie/page.tsx

# Calendrier
sed -i '' 's/className="p-8"/className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8"/g' app/calendrier/page.tsx
sed -i '' 's/className="text-4xl/className="text-2xl sm:text-3xl lg:text-4xl/g' app/calendrier/page.tsx

# Paramètres
sed -i '' 's/className="p-8"/className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8"/g' app/parametres/page.tsx
sed -i '' 's/className="text-4xl/className="text-2xl sm:text-3xl lg:text-4xl/g' app/parametres/page.tsx

echo "✅ Optimisation terminée !"
