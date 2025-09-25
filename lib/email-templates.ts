export interface EmailTemplate {
  subject: string;
  preHeader: string;
  html: string;
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    subject: "Welcome to ALERA. Your foundation is ready.",
    preHeader: "Your all-in-one career manager is waiting.",
    html: `<!DOCTYPE html>  
<html lang="en">  
<head> 
<meta charset="UTF-8"> 
<meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta http-equiv="X UA-Compatible" content="ie=edge"> <title>Welcome to ALERA</title> 
<style> 
@import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
body { 
margin: 0; 
padding: 0; 
background-color: #121212; font-family: 'Inter', Arial, sans-serif; 
} .container { 
width: 100%; 
max-width: 600px; 
margin: 0 auto; 
padding: 40px 20px; background-color: #1A1A1A; color: #E0E0E0; 
} .header { 
text-align: center; 
padding-bottom: 30px; } 
.header img { 
 max-width: 100px; } 
.content h1 { font-size: 28px; font-weight: 700; color: #FFFFFF; margin-top: 0; } 
.content p { 
font-size: 16px; line-height: 1.6; color: #A3A3A3; 
} .step { 
margin-bottom: 30px; } 
.step h2 { 
font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 10px 0; 
} .button {
display: inline-block; 
padding: 12px 24px; 
background-color: #A04EF7; /* ALERA Purple */ color: #FFFFFF; 
text-decoration: none; 
border-radius: 8px; 
font-weight: 600; 
margin-top: 15px; 
} .trial-info { 
background-color: #242424; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; } 
.footer { 
text-align: center; 
padding-top: 30px; 
border-top: 1px solid #333333; font-size: 12px; 
 color: #757575; } 
</style> </head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
<div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
<div class="header" style="text-align: center; padding-bottom: 30px;"> 
<img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width: 600px;"> </div> 
<div class="content"> 
<h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top:  0;">Your 
foundation is ready.</h1> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Welcome to ALERA. We built this platform to provide the foundation independent artists need to build a sustainable  career on their own terms. Your account is now active.</p> 
<div class="step" style="margin-bottom: 30px;"> 
<h2 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 10px 0;">1. Create Your Public Page</h2> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Use the Landing Page Builder in the "My Page" tab to create a central hub for your fans in minutes.</p> <a href="https://app.alera.fm/dashboard/my-page" class="button" style="display: inline-block; padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 15px;">Build Your Page</a> </div> 
<div class="step" style="margin-bottom: 30px;"> 
<h2 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 10px 0;">2. Prepare a Release</h2> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">When you're ready to release music, head to the "New Release" tab to get everything set up. Upgrading to a paid plan  unlocks unlimited distribution.</p>
<a href="https://app.alera.fm/dashboard/new-release" class="button" style="display: inline-block; padding:  12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none; border-radius:  8px; font-weight: 600; margin-top: 15px;">Start a Release</a> 
</div> 
<div class="step" style="margin-bottom: 30px;"> 
<h2 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 10px 0;">3. Set Up  Your Wallet</h2> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Connect your payout method in the  "Wallet" tab so you're ready to receive any future earnings from tips or subscriptions.</p> <a href="https://app.alera.fm/dashboard/wallet" class="button" style="display: inline-block; padding:  12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none; border-radius: 8px;  font-weight: 600; margin-top: 15px;">Go to Wallet</a> 
</div> 
<div class="trial-info" style="background-color: #242424; padding: 20px; border-radius: 8px;  text-align: center; margin: 30px 0;"> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">As an early partner, your account  starts with a <strong>1-month free trial</strong>, giving you full access to all of our tools.</p> </div> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">If you have any questions, just ask  your AI Agent in the cockpit. We're excited to see what you build.</p> 
<p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
</div> 
<div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid #333333;  font-size: 12px; color: #757575;"> 
<p>&copy; 2025 ALERA. All Rights Reserved.<br> 
You received this email because you signed up for an account on alera.fm.</p> </div> </div> </body> 
</html>`
  },

  artistPageTip: {
    subject: "A quick tip for your artist page",
    preHeader: "Own your online presence with a central hub for your fans.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>A quick tip for your artist page</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .tip-box { 
 background-color: #242424; 
 padding: 25px; 
 border-radius: 8px; 
 margin: 30px 0; 
 border-left: 5px solid #00C4FF; /* A cool blue for "tip" status */ 
 } 
 .tip-box p { 
 margin: 0; 
 font-size: 16px; 
 color: #FFFFFF; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin top: 0;">A quick tip for your page.</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p>  <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hope you're settling into the  ALERA cockpit.</p> 
  
 <div class="tip-box" style="background-color: #242424; padding: 25px; border-radius:  8px; margin: 30px 0; border-left: 5px solid #00C4FF;"> 
 <p style="margin: 0; font-size: 16px; color: #FFFFFF;"><strong>Pro Tip:</strong>  Think of your public ALERA page as the central hub for your entire online presence. It's the one  link you can put in your Instagram bio or share on TikTok that has everything in one place.</p>  </div> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">A great page often includes  direct links to your music, a way for fans to join your Fan Zone, and an easy way for supporters  to leave a tip.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">You can build and  customize yours anytime in the "My Page" tab.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/my-page" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Customize Your  Page</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">If you  ever need ideas, just ask your AI Career Manager.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  aiCareerManager: {
    subject: "Your AI Career Manager is ready to help",
    preHeader: "Ask it anything about your music, fans, or your next release.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your AI Career Manager is ready to help</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .tip-box { 
 background-color: #242424; 
 padding: 25px; 
 border-radius: 8px; 
 margin: 30px 0; 
 border-left: 5px solid #00C4FF; /* A cool blue for "tip" status */ 
 } 
 .tip-box p { 
 margin: 0; 
 font-size: 16px; 
 color: #FFFFFF; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Meet Your AI Career Manager</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">It's been a week since you joined ALERA. By now, you've seen the tools we offer, but the real  power comes from the intelligence that connects them all.</p> 
  
 <div class="tip-box" style="background-color: #242424; padding: 25px; border-radius:  8px; margin: 30px 0; border-left: 5px solid #00C4FF;"> 
 <p style="margin: 0; font-size: 16px; color: #FFFFFF;"><strong>Pro tip:</strong> Your AI Career Manager is always available to help you make smarter decisions. It's  connected to your analytics, your wallet, and your releases, so it can give you personalized  advice based on your actual data.</p>  </div> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Try asking it something like:</p> 
 <ul style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">
 <li>"Which of my songs is most popular right now?"</li>
 <li>"Give me some marketing ideas for my next release."</li>
 <li>"Where are most of my listeners located?"</li>
 </ul>
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Ask Your Agent</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">The more you use it, the smarter it gets.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  timeToMakeRelease: {
    subject: "Ready to release your music with ALERA?",
    preHeader: "Let's get your music out to the world. Here's how to start.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Ready to release your music with ALERA?</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Time to Make a Release</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Releasing music is the best way to grow your audience and start seeing your analytics and  earnings come to life inside your dashboard. Our simple release flow makes it easy to get your  tracks on Spotify, Apple Music, and every other major platform.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Ready to get your music heard? Upgrading to a paid plan unlocks unlimited distribution for your  singles, EPs, and albums.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/new-release" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Start Your Release</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">If you have any questions about preparing your audio or artwork, your AI Career Manager is  always ready to help.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  trialEndingSoon: {
    subject: "Your ALERA free trial is ending in 7 days",
    preHeader: "Don't lose access to your releases and career tools. Upgrade your plan now.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your ALERA free trial is ending in 7 days</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Your Free Trial is Ending Soon</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Just a heads-up that your 1-month free trial of ALERA is ending in 7 days. We hope you've had  a chance to see how our tools can help you manage and grow your music career.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">To ensure your releases stay live and you keep access to your analytics, wallet, and Fan Zone,  please upgrade to a paid plan before your trial ends.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/subscription" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Upgrade Your Plan</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">If you have any questions about the Plus or Pro plans, feel free to ask your AI Career Manager  or reply to this email.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  trialEnded: {
    subject: "Your ALERA free trial has ended",
    preHeader: "Please upgrade to a paid plan to continue using your ALERA tools.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your ALERA free trial has ended</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Your Free Trial Has Ended</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Your 1-month free trial of ALERA has now ended. Your access to Pro features like the Fan Zone,  unlimited releases, and the AI Career Manager has been paused.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Your data, any previous releases, and your settings are all safely saved. To regain full access  and continue managing your music career with ALERA, please upgrade to a paid plan.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Ready to continue? Choose a plan that fits your journey and pick up right where you left off.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/subscription" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Upgrade Your Plan</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">If you have any questions, you can send us an email at contact@alera.fm.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  releaseSubmitted: {
    subject: "We've Received Your Release, [Release Title]",
    preHeader: "It's now with our review team. We'll have an update for you soon!",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>We've Received Your Release</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Release Submitted for Review</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">This is a confirmation that your release, "[Release Title]", has been successfully submitted and  is now under review by the ALERA team.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Our team will now check the audio, artwork, and metadata to ensure it meets the guidelines for  all major streaming platforms.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">You can track the status of your release at any time in the "My Music" tab of your ALERA  cockpit. We will notify you again as soon as it has been approved and sent to stores.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Thanks,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  releaseApproved: {
    subject: "Good news! Your release \"[Release Title]\" has been approved.",
    preHeader: "It's now on its way to Spotify, Apple Music, and all other major stores.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your Release Has Been Approved</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Your Release Has Been Approved</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Good news! Your release, "[Release Title]", has been approved by our team and has been sent  to all the stores you selected.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">It can take anywhere from a few days to a week for your release to appear live on all platforms.  We will send you another email with a universal smart link as soon as it's available everywhere.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">In the meantime, you can check its status in your ALERA cockpit.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/my-music" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">View in My Music</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">Congratulations on the upcoming release!</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  releaseLive: {
    subject: "It's Live! Your new release \"[Release Title]\" is out now.",
    preHeader: "Share your music with the world!",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your Release is Now Live!</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Your Release is Now Live!</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Congratulations!</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Your new release, "[Release Title]", is now live and available on all major streaming platforms,  including Spotify, Apple Music, and more.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">You should definitely think about adding this release to your "releases" section on your landing  page via the "My Page" tab in the ALERA artist cockpit.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/my-page" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">View My Page</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">Also, you can now start tracking its performance in the "Analytics" tab of your ALERA cockpit. Well done on the new release!</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  releaseRejected: {
    subject: "An update regarding your release, \"[Release Title]\"",
    preHeader: "Your release submission requires your attention before it can be sent to stores.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Action Required on Your Release</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Action Required on Your Release</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Our review team has assessed your release, "[Release Title]", and it has not been approved for  distribution at this time.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">This can be for a number of reasons, including invalid audio files, artwork that doesn't meet  store guidelines, detection of unauthorized AI-generated content, or potential copyright  infringement.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Don't panic. If you believe this is a mistake, you can either correct any issues and resubmit the  track through the "New Release" portal, or you can contact us directly by reaching out to  contact@alera.fm.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/new-release" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Start a New Release</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  payoutSent: {
    subject: "Your payout of [Amount] is on its way!",
    preHeader: "We've sent your recent ALERA earnings to your selected payout method.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your Payout Has Been Sent</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Your Payout Has Been Sent</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Good news! Your recent payout request has been processed.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">We have sent [Amount] to your selected payout method ([Payout Method], ending in [Last 4  digits/partial email]).</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Please allow 1-5 business days for the funds to appear in your account, depending on your  bank or payment provider. You can view the details of this transaction in the "Wallet" tab of your  ALERA cockpit.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/wallet" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">View Wallet</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">Keep up the great work.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  payoutMethodApproved: {
    subject: "Your new payout method has been approved",
    preHeader: "You can now receive payouts to [Payout Method] account.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Your New Payout Method is Approved</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Your New Payout Method is Approved</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">This is a confirmation that the new payout method ([Payout Method]) you added to your ALERA  account has been reviewed and approved by our team.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All future withdrawals will now be sent to this method.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">If you did not recently add or request to change your payout method, please contact our support  team immediately at contact@alera.fm.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/wallet" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Go to Wallet</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">Thanks,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  subscriptionConfirmation: {
    subject: "Welcome to ALERA [Plus/Pro]!",
    preHeader: "Your subscription is confirmed. Here's what you've unlocked.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Subscription Confirmation</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Subscription Confirmation</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Welcome to ALERA [Plus/Pro]! Your subscription is now active, and you've unlocked a new suite  of tools to help you build your career.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Your Plan: ALERA [Plus/Pro]</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Billing Cycle: [Monthly/Annual]</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">You now have access to [e.g., "unlimited releases, access to ALERA's Ai manager, fan  management tools and more" for Plus, or "all features, including direct-to-fan monetization and  the unlimited AI Career Manager" for Pro].</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">You can manage your subscription at any time in your account settings.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/settings" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Go to My Account</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">Thanks for being part of the ALERA community.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">All the best,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  emailVerification: {
    subject: "Verify your ALERA account",
    preHeader: "Complete your account setup by verifying your email address.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Verify Your ALERA Account</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans-serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width: 600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Verify Your Email Address</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Welcome to ALERA! To complete your account setup and start building your music career, please verify your email address by clicking the button below.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">This step ensures you receive important updates about your releases, earnings, and account activity.</p> 
  
 <div style="text-align: center;"> 
 <a href="[VERIFICATION_URL]" class="button" style="display: inline-block; padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Verify Email Address</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 30px;"><strong>Important:</strong></p> 
 <ul style="font-size: 16px; line-height: 1.6; color: #A3A3A3;"> 
 <li>This link will expire in 24 hours</li> 
 <li>If you didn't create an ALERA account, please ignore this email</li> 
 <li>For security reasons, please don't share this verification link</li> 
 </ul> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">If you have any questions, contact our support team at contact@alera.fm.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Welcome to the ALERA community!</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">The ALERA Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  },

  subscriptionPaymentFailed: {
    subject: "Action Required: There's an issue with your ALERA subscription payment",
    preHeader: "Please update your payment method to keep access to your Pro/Plus features.",
    html: `<!DOCTYPE html> 
<html lang="en"> 
<head> 
 <meta charset="UTF-8"> 
 <meta name="viewport" content="width=device-width, initial-scale=1.0">  <meta http-equiv="X-UA-Compatible" content="ie=edge"> 
 <title>Subscription Payment Failed</title> 
 <style> 
 @import url('https://fonts.googleapis.com/css2? 
family=Inter:wght@400;600;700&display=swap'); 
 body { 
 margin: 0; 
 padding: 0; 
 background-color: #121212; 
 font-family: 'Inter', Arial, sans-serif; 
 } 
 .container { 
 width: 100%; 
 max-width: 600px; 
 margin: 0 auto; 
 padding: 40px 20px; 
 background-color: #1A1A1A; 
 color: #E0E0E0; 
 } 
 .header { 
 text-align: center; 
 padding-bottom: 30px; 
 } 
 .header img { 
 max-width: 100px; 
 } 
 .content h1 { 
 font-size: 28px; 
 font-weight: 700; 
 color: #FFFFFF;
 margin-top: 0; 
 } 
 .content p { 
 font-size: 16px; 
 line-height: 1.6; 
 color: #A3A3A3; 
 } 
 .button { 
 display: inline-block; 
 padding: 12px 24px; 
 background-color: #A04EF7; /* ALERA Purple */ 
 color: #FFFFFF; 
 text-decoration: none; 
 border-radius: 8px; 
 font-weight: 600; 
 margin-top: 25px; 
 text-align: center; 
 } 
 .footer { 
 text-align: center; 
 padding-top: 30px; 
 border-top: 1px solid #333333; 
 font-size: 12px; 
 color: #757575; 
 } 
 </style> 
</head> 
<body style="margin: 0; padding: 0; background-color: #121212; font-family: 'Inter', Arial, sans serif;"> 
 <div class="container" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px  20px; background-color: #1A1A1A; color: #E0E0E0;"> 
 <div class="header" style="text-align: center; padding-bottom: 30px;">  <img src="https://i.imgur.com/87B9DNn.jpeg" alt="ALERA Logo" style="max-width:  600px;"> 
 </div>
 <div class="content"> 
 <h1 style="font-size: 28px; font-weight: 700; text-align: center;color: #FFFFFF; margin-top: 0;">Subscription Payment Failed</h1> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Hi [Artist Name],</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">We were unable to process the recent payment for your ALERA [Plus/Pro] subscription. This  can happen if your card has expired or there are insufficient funds.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">To ensure your access to premium features remains uninterrupted, please update your payment  method as soon as possible.</p> 
  
 <div style="text-align: center;"> 
 <a href="https://app.alera.fm/dashboard/settings" class="button" style="display: inline-block;  padding: 12px 24px; background-color: #A04EF7; color: #FFFFFF; text-decoration: none;  border-radius: 8px; font-weight: 600; margin-top: 25px; text-align: center;">Update Payment Method</a> 
 </div> 
  
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3; margin-top: 40px;">If your payment isn't updated within 5 days, your account will be downgraded to the Free Trial  plan, and your access to premium features will be paused.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">If you have any questions, please reply to this email.</p> 
 <p style="font-size: 16px; line-height: 1.6; color: #A3A3A3;">Thanks,<br>The ALERA  Team</p> 
 </div> 
 <div class="footer" style="text-align: center; padding-top: 30px; border-top: 1px solid  #333333; font-size: 12px; color: #757575;"> 
 <p>&copy; 2025 ALERA. All Rights Reserved.<br> 
 You received this email because you signed up for an account on alera.fm.</p>  </div> 
 </div> 
</body> 
</html>`
  }
};

export function getEmailTemplate(templateName: string): EmailTemplate | null {
  return EMAIL_TEMPLATES[templateName] || null;
}

export function replaceEmailPlaceholders(html: string, artistName: string, data?: {
  releaseTitle?: string;
  amount?: string;
  payoutMethod?: string;
  lastFour?: string;
  tier?: string;
  billingCycle?: string;
  verificationUrl?: string;
}): string {
  let result = html.replace(/\[Artist Name\]/g, artistName);
  
  if (data?.releaseTitle) {
    result = result.replace(/\[Release Title\]/g, data.releaseTitle);
  }
  if (data?.amount) {
    result = result.replace(/\[Amount\]/g, data.amount);
  }
  if (data?.payoutMethod) {
    result = result.replace(/\[Payout Method\]/g, data.payoutMethod);
  }
  if (data?.lastFour) {
    result = result.replace(/\[Last 4 digits\/partial email\]/g, data.lastFour);
  }
  if (data?.tier) {
    result = result.replace(/\[Plus\/Pro\]/g, data.tier);
  }
  if (data?.billingCycle) {
    result = result.replace(/\[Monthly\/Annual\]/g, data.billingCycle);
  }
  if (data?.verificationUrl) {
    result = result.replace(/\[VERIFICATION_URL\]/g, data.verificationUrl);
  }
  
  return result;
}
