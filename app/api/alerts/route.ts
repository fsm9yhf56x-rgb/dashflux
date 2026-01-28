// app/api/alerts/route.ts
// API Route pour gérer les alertes email

import { NextRequest, NextResponse } from 'next/server';

// Types
interface AlertRequest {
  type: 'score_alert' | 'weekly_digest';
  userEmail: string;
  assets?: Array<{
    ticker: string;
    name: string;
    score: number;
    recommendation: string;
  }>;
}

// ============================================
// POST /api/alerts - Envoyer une alerte
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body: AlertRequest = await request.json();
    
    // Validation
    if (!body.type || !body.userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Déterminer le type d'alerte
    switch (body.type) {
      case 'score_alert':
        await sendScoreAlert(body);
        break;
      case 'weekly_digest':
        await sendWeeklyDigest(body);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid alert type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error sending alert:', error);
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    );
  }
}

// ============================================
// Fonctions d'envoi d'email
// ============================================

async function sendScoreAlert(data: AlertRequest) {
  // TODO: Implémenter avec Resend, SendGrid, ou autre service email
  
  const emailContent = generateScoreAlertEmail(data);
  
  // Exemple avec Resend (à installer: npm install resend)
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'DashFlux <alerts@dashflux.com>',
    to: data.userEmail,
    subject: `🚀 Nouvelle opportunité détectée sur ${data.assets?.length} asset(s)`,
    html: emailContent,
  });
  */
  
  // Pour l'instant, juste logger
  console.log('Score Alert Email:', {
    to: data.userEmail,
    assets: data.assets,
    content: emailContent
  });
}

async function sendWeeklyDigest(data: AlertRequest) {
  // TODO: Implémenter digest hebdomadaire
  console.log('Weekly Digest Email:', data);
}

// ============================================
// Templates d'email
// ============================================

function generateScoreAlertEmail(data: AlertRequest): string {
  const assets = data.assets || [];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .asset-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ff6b35; }
    .score { font-size: 32px; font-weight: bold; color: #ff6b35; }
    .recommendation { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
    .accumulate { background: #10b981; color: white; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 DashFlux Alert</h1>
      <p>Nouvelle(s) opportunité(s) détectée(s)</p>
    </div>
    
    <div class="content">
      <p>Bonjour,</p>
      <p>Le système DashFlux a détecté <strong>${assets.length} asset(s)</strong> qui viennent d'atteindre ou dépasser votre seuil ACCUMULATE :</p>
      
      ${assets.map(asset => `
        <div class="asset-card">
          <h3>${asset.name} (${asset.ticker})</h3>
          <div class="score">${asset.score}/100</div>
          <span class="recommendation accumulate">${asset.recommendation}</span>
          <p style="margin-top: 15px; color: #666;">
            Cet asset a franchi votre seuil personnalisé et présente maintenant une opportunité d'accumulation selon la méthodologie Steffan.
          </p>
        </div>
      `).join('')}
      
      <center>
        <a href="https://dashflux.com/dashboard" class="button">
          Voir le dashboard complet
        </a>
      </center>
    </div>
    
    <div class="footer">
      <p>⚠️ Ceci est une alerte automatique basée sur vos paramètres personnalisés.<br>
      Ce n'est pas un conseil en investissement.</p>
      <p><a href="https://dashflux.com/settings">Gérer mes alertes</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// CRON JOB - Digest hebdomadaire
// ============================================

// À appeler via un cron (Vercel Cron, Node-cron, etc.)
export async function generateWeeklyDigest() {
  // 1. Fetch tous les users avec weeklyDigest activé
  // const users = await db.users.findMany({ where: { weeklyDigest: true } });
  
  // 2. Fetch les scores de la semaine
  // const scores = await fetch('/api/scores').then(r => r.json());
  
  // 3. Analyser les meilleurs performers
  // const topPerformers = scores.filter(s => s.score >= 75).slice(0, 5);
  
  // 4. Envoyer à chaque user
  // for (const user of users) {
  //   await sendWeeklyDigest({
  //     type: 'weekly_digest',
  //     userEmail: user.email,
  //     assets: topPerformers
  //   });
  // }
  
  console.log('Weekly digest sent');
}

// ============================================
// UTILISATION CÔTÉ CLIENT
// ============================================

/*
// Dans un composant ou useEffect :

async function checkAndAlert(scores: AssetScore[]) {
  const { settings } = useSettings();
  
  if (!settings.scoreAlerts) return;
  
  const userEmail = 'user@example.com'; // À récupérer du profil
  
  const opportunities = scores.filter(s => 
    s.score >= settings.accumulateThreshold
  );
  
  if (opportunities.length > 0) {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'score_alert',
        userEmail,
        assets: opportunities.map(s => ({
          ticker: s.ticker,
          name: s.name,
          score: s.score,
          recommendation: s.recommendation
        }))
      })
    });
  }
}
*/

// ============================================
// CONFIGURATION RESEND (si utilisé)
// ============================================

/*
1. Installer Resend:
   npm install resend

2. Créer un compte sur resend.com

3. Ajouter dans .env.local:
   RESEND_API_KEY=re_xxxxxxxxxxxxx

4. Décommenter le code d'envoi ci-dessus
*/

// ============================================
// ALTERNATIVE : SMTP Direct
// ============================================

/*
Avec nodemailer:

npm install nodemailer

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: '"DashFlux" <alerts@dashflux.com>',
  to: userEmail,
  subject: 'Nouvelle opportunité',
  html: emailContent
});
*/