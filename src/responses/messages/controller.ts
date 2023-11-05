export default function GenerateMessage(alert: string, matchers: any): string {
  let result: string, keywords: RegExpMatchArray | null;

  keywords = alert.match(new RegExp("{{\\w+}}", "gi"));

  if (keywords) {
    result = alert.replace(
      new RegExp(keywords?.join("|"), "gi"),
      (ev: string | undefined) => {
        return matchers[ev as any] || "N/A";
      }
    );
  } else {
    result = alert;
  }

  return result;
}
