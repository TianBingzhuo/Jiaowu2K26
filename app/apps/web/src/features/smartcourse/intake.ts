export const MAX_MATERIAL_BYTES = 50 * 1024 * 1024;

export const MATERIAL_FORMATS = {
  ".mp3": "MP3",
  ".mp4": "MP4",
  ".pdf": "PDF",
  ".pptx": "PPTX",
  ".wav": "WAV",
} as const;

export type MaterialFormat =
  (typeof MATERIAL_FORMATS)[keyof typeof MATERIAL_FORMATS];

export type MaterialCandidate = {
  name: string;
  size: number;
  rightsDeclared: boolean;
};

export type MaterialValidation =
  | {
      ok: true;
      format: MaterialFormat;
      sizeLabel: string;
    }
  | {
      ok: false;
      code:
        | "empty_file"
        | "file_too_large"
        | "rights_required"
        | "unsupported_format";
      message: string;
    };

export function formatMaterialSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateMaterialCandidate(
  candidate: MaterialCandidate,
): MaterialValidation {
  if (candidate.size <= 0) {
    return {
      ok: false,
      code: "empty_file",
      message: "空文件不能进入材料链。",
    };
  }
  if (candidate.size > MAX_MATERIAL_BYTES) {
    return {
      ok: false,
      code: "file_too_large",
      message: "材料超过 50 MB；请压缩、分段或改用正式上传适配器。",
    };
  }
  const extension = candidate.name
    .slice(candidate.name.lastIndexOf("."))
    .toLowerCase() as keyof typeof MATERIAL_FORMATS;
  const format = MATERIAL_FORMATS[extension];
  if (!format) {
    return {
      ok: false,
      code: "unsupported_format",
      message: "当前只接受 MP3、WAV、MP4、PPTX 与 PDF。",
    };
  }
  if (!candidate.rightsDeclared) {
    return {
      ok: false,
      code: "rights_required",
      message: "必须先确认有权用于本地教学演示，系统才会计算哈希。",
    };
  }
  return {
    ok: true,
    format,
    sizeLabel: formatMaterialSize(candidate.size),
  };
}

export async function sha256Hex(data: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
