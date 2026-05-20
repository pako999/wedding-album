import { redirect } from "next/navigation";

/**
 * Serbian language landing — there's no Serbian homepage yet, so route
 * /sr straight to the main Serbian guide.
 */
export default function SrIndex() {
  redirect("/sr/qr-kod-vencanje");
}
