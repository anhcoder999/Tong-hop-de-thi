import {z} from "zod";
import {DS_MON, type Mon} from "@/lib/data";
const BO_MON = DS_MON as [Mon, ...Mon[]];
export const schemaBoDe = z.object({
  mon: z.enum(BO_MON),
  ten: z.string().trim().min(3, "Tên đề tối thiểu 3 ký tự.").max(160, "Tên đề tối đa 160 ký tự."),
  mo_ta: z.string().trim().max(240, "Mô tả tối đa 240 ký tự."),
  thoi_gian_phut: z.coerce.number().int("Thời gian phải là số nguyên.").min(5, "Thời gian tối thiểu 5 phút.").max(180, "Thời gian tối đa 180 phút.")
});
export type GiaTriBoDe = z.infer<typeof schemaBoDe>;
export const schemaCauHoi = z.object({
  thu_tu: z.coerce.number().int("Số thứ tự phải là số nguyên.").min(1, "Thứ tự phải từ 1 trở lên."),
  diem: z.coerce.number().min(0.25, "Điểm tối thiểu 0.25.").max(10, "Điểm tối đa 10."),
  loai: z.enum(["trac_nghiem", "dung_sai", "tra_loi_ngan"]),
  noi_dung: z.string().trim().min(1, "Nội dung câu hỏi không được để trống."),
  lua_chon: z.array(z.object({ky_hieu: z.string(), noi_dung: z.string()})),
  dap_an_mcq: z.string(),
  dap_an_ds: z.record(z.boolean()),
  dap_an_ngan: z.string(),
  giai_thich: z.string().trim().max(4000, "Giải thích tối đa 4000 ký tự.")
}).superRefine((g, ctx) => {
  if (g.loai === "trac_nghiem") {
    const thieu = ["A", "B", "C", "D"].filter((k) => !(g.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? "").trim());
    if (thieu.length) ctx.addIssue({code: z.ZodIssueCode.custom, message: `Nhập đủ nội dung phương án: ${thieu.join(", ")}.`, path: ["loiLuaChon"]});
    if (!["A", "B", "C", "D"].includes(g.dap_an_mcq)) ctx.addIssue({code: z.ZodIssueCode.custom, message: "Chọn phương án đúng cho câu trắc nghiệm.", path: ["loiDapAn"]});
  }
  if (g.loai === "dung_sai") {
    const thieu = ["a", "b", "c", "d"].filter((k) => !(g.lua_chon.find((x) => x.ky_hieu === k)?.noi_dung ?? "").trim());
    if (thieu.length) ctx.addIssue({code: z.ZodIssueCode.custom, message: `Nhập đủ nội dung phát biểu: ${thieu.join(", ")}.`, path: ["loiLuaChon"]});
    const chuaChon = ["a", "b", "c", "d"].filter((k) => typeof g.dap_an_ds[k] !== "boolean");
    if (chuaChon.length) ctx.addIssue({code: z.ZodIssueCode.custom, message: `Chọn Đúng/Sai cho phát biểu: ${chuaChon.join(", ")}.`, path: ["loiDapAn"]});
  }
  if (g.loai === "tra_loi_ngan" && !g.dap_an_ngan.trim()) ctx.addIssue({code: z.ZodIssueCode.custom, message: "Nhập đáp án đúng cho câu trả lời ngắn.", path: ["dap_an_ngan"]});
});
export type GiaTriCauHoi = z.infer<typeof schemaCauHoi>;
export type LoiForm = Record<string, {message?: string} | undefined>;