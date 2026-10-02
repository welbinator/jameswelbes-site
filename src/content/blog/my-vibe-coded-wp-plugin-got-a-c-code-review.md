---
title: "My vibe coded WP plugin got a C+ code review."
description: "I recently vibe coded a WordPress plugin that creates form handlers for custom built forms, for folks that want to build their own forms rather than using..."
date: 2026-04-21
---

I recently vibe coded a WordPress plugin that creates form handlers for custom built forms, for folks that want to build their own forms rather than using some drag-and-drop form builder.

My contribution to code quality was downloading a wordpress-pro skill from ClawHub, integrating Snyk, Socket, and PHPCS/PHPStan into the project, and then trusting that the AI knew what it was doing. The output looked fine. The scanners were happy. I was happy. Good enough, I hoped.

Then I hired Marcin Dudek to review it.

Marcin is a WordPress developer with 15 years of experience, former CTO of CreativeMinds where he built and maintained 50+ plugins, and a member of the top 3% of freelance developers on Toptal. He recently launched a WordPress plugin code review and security audit service specifically aimed at AI-assisted development. His pitch is simple: he vibe-codes his own products too, so he knows exactly where the gaps show up. You can find his service at [marcindudek.dev/services/wp-plugin-review/](https://marcindudek.dev/services/wp-plugin-review/).

## The grade

His exact words: "The code quality here is better than most plugins I see. Nonces, prepared queries, capability checks all in the right places. First pass I was going to grade it B+. Then I dug into the feature logic."

He also said privately that it was better than 80% of plugins out there, and that there were zero typical problems and he had to try hard to find the serious issues. That was genuinely reassuring to hear.

## What he found

Three categories of issues, roughly.

The first was a rate limiting problem. The plugin had a rate limit feature, but it was off by default. You had to explicitly configure it per form or nothing was throttled at all. Combined with the auto-reply feature, that meant an attacker could submit a form with any email address as the recipient and use the site's verified sending domain to blast emails at whoever they wanted. Marcin confirmed this live during the review. Not theoretical.

The second was the GitHub updater. When the plugin checks for updates and downloads a new version, it handed the zip directly to WordPress with no hash verification. A compromised release asset or a man-in-the-middle attack could deliver arbitrary PHP to every site running the plugin.

The third was the encryption. API keys were stored using AES-256-CBC with no authentication tag. That means someone with database write access could manipulate ciphertexts in ways that survive decryption. There was also a last-resort key fallback that used the site URL and database prefix, which are predictable on a lot of installs.

Beyond those three, he found a handful of lower-severity issues: an SSRF vulnerability in the ActiveCampaign integration, some input sanitization gaps, spam detection rules that could be bypassed with trivial character changes, and a few code quality items.

## What we fixed

Everything. Same day.

Rate limiting now defaults to 5 submissions per hour per IP on every form, no configuration required. The GitHub updater now generates a SHA-256 hash of the release zip and uploads it as a separate asset. Before WordPress installs any update, the updater fetches that hash and verifies the download matches. If the hash file is missing, the update is blocked entirely. The encryption was upgraded to AES-256-GCM, which includes authentication as part of the cipher. No separate HMAC needed. Existing stored API keys are automatically migrated to the new format on the first admin page load after the update.

The SSRF issue in the ActiveCampaign integration was fixed with a hostname allowlist. The integration will now only make requests to domains that ActiveCampaign actually issues accounts on. The spam rules were tightened, the sanitization gaps were closed, and the code quality items were cleaned up.

The whole thing shipped as version 1.4.0.

## What I actually think about this

Here is the honest version: AI wrote all of this code, and the surface-level stuff was genuinely solid. The things Marcin found were not obvious. They required understanding how WordPress update mechanisms work, how email authentication interacts with form plugins, and what authenticated encryption actually means. The kind of knowledge that comes from spending years in the field, not from a prompt.

The AI produced code that looked correct and passed automated checks. The vulnerabilities were in the logic, not the syntax. No linter catches a missing rate limit default. No static analyzer flags the conceptual gap between "this cipher works" and "this cipher is authenticated."

That is the actual risk with AI-assisted development, and it is not that the code is obviously bad. It is that the code is good enough to pass every automated check while still having real problems that require a human expert to find. Fortunately, there are humans who specialize in exactly this, and Marcin's review is priced in a way that makes it hard to justify skipping.

If you are shipping a WordPress plugin, especially one that handles form submissions, email sending, or stored credentials, get it reviewed. The $250 full review is cheaper than the conversation you would have to have with your clients after a confirmed phishing relay.
