// Privacy policy, linked from the Google Play listing. Keep it in step with
// what the code actually sends: see app/page.js (fetch calls) and app/api.

export const metadata = {
  title: "Privacy policy · Bunker Now",
};

const CONTACT = "ospieli85@gmail.com";
const UPDATED = "2026-10-24";

export default function Privacy() {
  return (
    <div className="wrap privacy">
      <h1>🛡️ Bunker Now: privacy policy</h1>
      <p className="tag">
        Last updated {UPDATED}. <a href="#sv">På svenska nedan.</a>
      </p>

      <div className="card">
        <p>
          Bunker Now is an independent, non-commercial project, not an official service. It has no accounts, no
          ads, no analytics and no tracking.
        </p>

        <h2>Your location</h2>
        <p>
          <b>In the Android app</b>, your location is used on your phone to find the nearest shelters and to point
          the compass. It is not sent anywhere for that.
        </p>
        <p>
          <b>On the website</b>, your position is sent to our server to find the 3 nearest shelters. The server
          answers and does not store it.
        </p>

        <h2>Instructions and questions from Claude</h2>
        <p>
          When you are online, the app and the website ask our server for instructions written by Claude, an AI
          made by Anthropic. They send the language, the travel mode, the id of the nearest shelter and your
          distance to it. Together these show roughly which area you are in. If you ask a follow-up question, the
          question is sent too. Our server passes this to Anthropic to write the answer. See{" "}
          <a href="https://www.anthropic.com/legal/privacy">Anthropic&apos;s privacy policy</a>.
        </p>
        <p>
          Our server keeps instructions in memory for up to 6 hours, so the same request doesn&apos;t call Claude
          twice, and counts requests per IP address for one minute to limit abuse. Nothing is written to a
          database.
        </p>
        <p>
          The server runs on Vercel, which keeps short-lived technical logs that can include your IP address and
          the address of the request. See{" "}
          <a href="https://vercel.com/legal/privacy-policy">Vercel&apos;s privacy policy</a>.
        </p>

        <h2>&ldquo;I&apos;m safe&rdquo; message</h2>
        <p>
          The message is written on your phone and opened in your SMS or WhatsApp app. It contains your
          coordinates. It is only sent if you choose a recipient and press send yourself.
        </p>

        <h2>On your phone</h2>
        <p>Your chosen language is saved on your phone so the app remembers it.</p>

        <h2>Contact</h2>
        <p>
          Questions about privacy: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </div>

      <div className="card" id="sv" lang="sv">
        <h2>Integritetspolicy på svenska</h2>
        <p>
          Bunker Now är ett oberoende, icke-kommersiellt projekt och ingen myndighetstjänst. Appen har inga konton,
          ingen reklam, ingen analys och ingen spårning.
        </p>
        <p>
          <b>I Android-appen</b> används din plats i telefonen för att hitta närmaste skyddsrum och visa kompassen.
          Den skickas inte någonstans för det. <b>På webbplatsen</b> skickas din position till vår server för att
          hitta de 3 närmaste skyddsrummen. Servern svarar och sparar den inte.
        </p>
        <p>
          När du är uppkopplad ber appen och webbplatsen vår server om instruktioner skrivna av Claude, en AI från
          Anthropic. De skickar språk, färdsätt, id för närmaste skyddsrum och ditt avstånd dit, vilket ungefär
          visar i vilket område du är. Ställer du en följdfråga skickas frågan också. Servern skickar detta vidare
          till Anthropic för att skriva svaret. Instruktioner sparas i minnet i högst 6 timmar och förfrågningar
          räknas per IP-adress i en minut för att begränsa missbruk. Inget sparas i en databas. Servern körs hos
          Vercel, som sparar kortlivade tekniska loggar som kan innehålla din IP-adress.
        </p>
        <p>
          Meddelandet &ldquo;Jag är i säkerhet&rdquo; skrivs i telefonen och öppnas i din SMS- eller WhatsApp-app.
          Det innehåller dina koordinater och skickas bara om du själv väljer mottagare och trycker på skicka. Ditt
          valda språk sparas i telefonen.
        </p>
        <p>
          Frågor om integritet: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </div>
    </div>
  );
}
