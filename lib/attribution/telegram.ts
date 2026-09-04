import { htmlEscape } from "@/lib/telegram";
import {
  channelLabel,
  type SignupSourceSnapshot,
} from "@/lib/attribution/signup";

/** Render validated signup attribution for an HTML-mode Telegram message. */
export function signupSourceTelegramLines(source: SignupSourceSnapshot | null): string {
  if (!source) return "\n📍 <b>Vir prijave:</b> ni zaznan";

  const details = [
    `\n📍 <b>Vir prijave:</b> ${htmlEscape(channelLabel(source.channel))}`,
  ];
  if (source.siteHost) details.push(`🌍 <b>Domena:</b> ${htmlEscape(source.siteHost)}`);
  if (source.utmSource) details.push(`🏷 <b>UTM source:</b> ${htmlEscape(source.utmSource)}`);
  if (source.utmCampaign) details.push(`📣 <b>Kampanja:</b> ${htmlEscape(source.utmCampaign)}`);
  if (source.affiliateRef) details.push(`🤝 <b>Partner:</b> ${htmlEscape(source.affiliateRef)}`);
  if (source.referralCode) details.push(`🎁 <b>Priporočilo:</b> ${htmlEscape(source.referralCode)}`);
  if (source.referrerHost) details.push(`↗️ <b>Napotitelj:</b> ${htmlEscape(source.referrerHost)}`);
  if (source.landingPage) details.push(`📄 <b>Vstopna stran:</b> ${htmlEscape(source.landingPage)}`);
  return details.join("\n");
}
