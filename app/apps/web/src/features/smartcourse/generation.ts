import type {
  SourceFragment,
  TeachingObject,
} from "./types";

export type GenerationMode = "fixture" | "model" | "rule";

export type GenerationInput = {
  courseId: string;
  sources: SourceFragment[];
  seedObjects?: TeachingObject[];
};

export type GenerationResult = {
  adapterId: string;
  mode: GenerationMode;
  generatorVersion: string;
  objects: TeachingObject[];
  fallbackReason?: string;
};

export type ContentGenerationAdapter = {
  id: string;
  mode: GenerationMode;
  generate(input: GenerationInput): GenerationResult;
};

export function validateGeneratedObjects(
  objects: TeachingObject[],
  sources: SourceFragment[],
) {
  if (objects.length === 0) {
    throw new Error("Generation adapter returned no teaching objects.");
  }
  const validSourceIds = new Set(
    sources.filter((source) => source.valid).map((source) => source.id),
  );
  for (const object of objects) {
    if (!object.id.trim() || !object.body.trim()) {
      throw new Error("Generated objects require stable IDs and non-empty bodies.");
    }
    if (object.sourceIds.length === 0) {
      throw new Error(`Generated object ${object.id} has no source IDs.`);
    }
    const invalidSource = object.sourceIds.find(
      (sourceId) => !validSourceIds.has(sourceId),
    );
    if (invalidSource) {
      throw new Error(
        `Generated object ${object.id} references invalid source ${invalidSource}.`,
      );
    }
  }
}

export const FIXTURE_GENERATION_ADAPTER: ContentGenerationAdapter = {
  id: "fixture.smartcourse.v1",
  mode: "fixture",
  generate(input) {
    const objects = structuredClone(input.seedObjects ?? []);
    validateGeneratedObjects(objects, input.sources);
    return {
      adapterId: this.id,
      mode: this.mode,
      generatorVersion: "smartcourse-fixture-v1",
      objects,
      fallbackReason:
        "AI 服务尚未连接；本回合先使用有明确标注的本地演示内容。",
    };
  },
};
