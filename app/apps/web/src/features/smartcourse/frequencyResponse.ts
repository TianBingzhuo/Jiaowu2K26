export type FrequencyResponsePoint = {
  frequencyHz: number;
  idealMagnitudeDb: number;
  capacitanceToleranceMagnitudeDb: number;
  inputLoadMagnitudeDb: number;
  idealPhaseDeg: number;
};

export type FrequencyResponseModel = {
  modelId: string;
  modelVersion: string;
  generatedAt: string;
  measured: false;
  sourceIds: string[];
  parameters: {
    resistanceOhm: number;
    capacitanceFarad: number;
    capacitanceTolerancePercent: number;
    inputResistanceOhm: number;
  };
  nominalCutoffHz: number;
  toleranceCutoffHz: number;
  points: FrequencyResponsePoint[];
};

const round = (value: number, digits = 2) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

const magnitudeDb = (real: number, imaginary: number) =>
  20 * Math.log10(1 / Math.hypot(real, imaginary));

const phaseDeg = (real: number, imaginary: number) =>
  (-Math.atan2(imaginary, real) * 180) / Math.PI;

export function buildFrequencyResponseModel(
  frequenciesHz = [100, 300, 1_000, 1_592, 3_000, 10_000],
): FrequencyResponseModel {
  const resistanceOhm = 1_000;
  const capacitanceFarad = 100e-9;
  const capacitanceTolerancePercent = 10;
  const inputResistanceOhm = 1_000_000;
  const toleranceCapacitance =
    capacitanceFarad * (1 + capacitanceTolerancePercent / 100);

  const points = frequenciesHz.map((frequencyHz) => {
    const angularFrequency = 2 * Math.PI * frequencyHz;
    const nominalImaginary =
      angularFrequency * resistanceOhm * capacitanceFarad;
    const toleranceImaginary =
      angularFrequency * resistanceOhm * toleranceCapacitance;
    const loadedReal = 1 + resistanceOhm / inputResistanceOhm;

    return {
      frequencyHz,
      idealMagnitudeDb: round(magnitudeDb(1, nominalImaginary)),
      capacitanceToleranceMagnitudeDb: round(
        magnitudeDb(1, toleranceImaginary),
      ),
      inputLoadMagnitudeDb: round(
        magnitudeDb(loadedReal, nominalImaginary),
      ),
      idealPhaseDeg: round(phaseDeg(1, nominalImaginary), 1),
    };
  });

  return {
    modelId: "sls240-rc-lowpass-model-court",
    modelVersion: "1.0.0",
    generatedAt: "2026-07-25T10:30:00+08:00",
    measured: false,
    sourceIds: [
      "source-sls-slide-012",
      "source-sls-transcript-004",
      "source-sls-handout-003",
    ],
    parameters: {
      resistanceOhm,
      capacitanceFarad,
      capacitanceTolerancePercent,
      inputResistanceOhm,
    },
    nominalCutoffHz: round(
      1 / (2 * Math.PI * resistanceOhm * capacitanceFarad),
    ),
    toleranceCutoffHz: round(
      1 / (2 * Math.PI * resistanceOhm * toleranceCapacitance),
    ),
    points,
  };
}

export const FREQUENCY_RESPONSE_MODEL = buildFrequencyResponseModel();
