export function calculateBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  if (heightM <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi: number) {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidad I";
  if (bmi < 40) return "Obesidad II";
  return "Obesidad III";
}
