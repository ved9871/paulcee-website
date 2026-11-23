# How to edit paulcee.co.uk

This is the editor guide for Paul. It covers everything you need day to day. Keep it open in a tab the first few times.

**The editor:** https://ved9871.github.io/paulcee-website/admin/
**Site tools (backups, undo, access):** https://ved9871.github.io/paulcee-website/admin/tools/ (also the blue **Site tools** button at the bottom right of the editor; its links open in new tabs)

Both addresses change to the paulcee.co.uk subdomain when the site moves. Nothing else changes.

## Signing in

1. Open the editor link and press **Sign In with GitHub**.
2. A small window asks you to log in to GitHub (first time only) and to approve "Paul Cee CMS". Approve it.
3. You land on the dashboard. Down the left are the things you can edit: **Blog posts**, **Pages**, **Rallies and events**, **Products**, **Blog topics** and **Settings**.

If you get "not a collaborator" or a blank screen after signing in, your GitHub account hasn't been given access yet. See "Who can edit" below.

## What happens when you save

Every **Save** goes live on its own. There is no separate publish button. The site rebuilds in about two to three minutes, so give it that long before checking the page.

Two ways to keep something hidden while you work on it:

- **Draft.** Tick "Draft (saved but not published)" at the top of a post. It stays off the site until you untick it.
- **Future date.** Set the publish date to a later day. The post appears on that morning, around 6am UK time.

Nothing is ever lost. Every save is kept in the history, and the whole site is backed up every Sunday. See "Undo and backups".

## Writing a blog post

1. Click **Blog posts**, then **New** (top right).
2. Fill in:
   - **Title.** Also becomes the web address, so get it right before the first save. Changing the title later doesn't change the address, which is what you want: links keep working.
   - **Publish date.** Press **Now** for today. Pick a later date to schedule it.
   - **Draft.** Tick it if the post isn't ready.
   - **Hide from Google search.** Tick it for things you want on the site but not in Google, such as a competition page or a notice.
   - **Topic.** Which part of the blog it belongs to (Manticore, Equinox, Beach detecting, and so on). This is what the filter buttons on the blog page use.
   - **Cover image.** The picture used on the blog cards and at the top of the post. Optional, but posts look better with one.
   - **Main YouTube video.** Paste the YouTube link if the post is about a video. It shows above the text.
   - **Summary.** One or two sentences. Shows on the blog cards and is what Google shows under the title unless you fill in the SEO section.
3. Write the article (see "The editor" below).
4. **SEO (Google)** at the bottom is optional. Leave it alone unless you want a different title or description in Google results.
5. Press **Save**.

## The editor

The article box works like a simple Word document. The preview on the right shows what you have written as you type.

- **Headings.** Click the paragraph symbol (¶) at the left of the toolbar and choose Heading 2 for main sections, Heading 3 for sub-sections. Don't use Heading 1: the title is already the Heading 1.
- **Bold, italic, links.** Select the words, then use the toolbar. For links, paste the full address including `https://`.
- **Pictures.** Click the picture icon. Upload from your computer or pick one already on the site. Photos are converted and shrunk automatically, so phone photos are fine. Fill in both boxes:
  - **Alt text** is for Google and screen readers: say what is actually in the picture, in one plain sentence ("Minelab Manticore screen showing Beach General with sensitivity at 24", "Hammered silver penny found on a Lincolnshire field"). Every picture should have one.
  - **Title** is the caption shown under the picture on the site. Keep it short and add something the alt text doesn't (where, when, the result). If you want a picture to show small, start the title with `small:` followed by the caption.
- **Lists and quotes** are in the ¶ menu too.
- **Enter** makes a new paragraph.

### Insert menu: videos, buy boxes and ads

The **Insert** button on the toolbar adds the special blocks:

- **YouTube video.** Paste the video link or its ID and an optional title. The video shows as a clickable thumbnail that plays on the page.
- **Product box (Crawfords).** Pick the detector or accessory from the list (the box shows nothing until one is picked). The site puts in the picture, the price line, the "Buy at Crawfords" button with your tracking link and the discount code. You never need to type a Crawfords link by hand.
- **AdSense slot.** Puts a specific AdSense ad unit at that point. Google already places ads on every page automatically (Auto ads), so you only need this if Ved gives you a slot number for a particular spot.

Each block has a small form. Fill it in and keep typing underneath. The **x** on the block removes it.

### Maps, widgets and other HTML

To put an interactive map or a widget on a page, paste its HTML into a **Code Block** (¶ menu, then Code Block) and set the language of the block to **HTML**. On the site it appears as an embedded frame about 600px tall. The frame is sealed off from the rest of the page, so scripts inside it cannot touch the site. Code blocks in any other language show as code, which is what you want for settings listings.

### Tables

Use **Insert → Table** on the toolbar. Pick the number of rows and columns, then click into a cell and type; the Tab key moves to the next cell. Use the small menu on a cell to add or remove rows and columns. The first row is the heading row and is shown in bold on the site. Tables scroll sideways on phones, so four or five columns is a sensible maximum.

Pasting a table from Word or Google Docs also works: paste it into the article and it becomes an editor table.

### Anything unusual

If something looks odd, click **Edit in Markdown** on the toolbar to see the raw text, and click the same button to go back. If in doubt, leave the Markdown view alone and ask Ved.

## Editing a page

Pages are the fixed parts of the site: the detector guides, About, Contact, the rally page and so on.

1. Click **Pages**, then the page.
2. Edit the text the same way as a post.
3. Press **Save**.

Renaming a page is safe: the old address forwards to the new one automatically, and the menus follow. The detector guides are also linked from Crawfords, so tell Ved when you rename one of those.

**Rallies and events page.** The upcoming and past events list appears on whichever page has the **Show the rallies & events list on this page** box ticked (currently the Detecting Events page). Tick it on one page only.

**Deleting a page or post.** The site copes: menu entries to it disappear and any links to it in other articles turn into plain text. But its old web address stops working, and at launch the old paulcee.co.uk address will too, so tell Ved which pages you've removed so he can point the old addresses somewhere sensible.

## Rallies and events

**Rallies and events** holds the dates shown on the rally page and the homepage. Add one with **New**: name, date, where, a sentence or two, and a link if there is one (a Crawfords link gets your tracking added automatically). Past events drop off the homepage on their own and stay on the rally page under "Past".

## Products

**Products** is the list that the "Product box" picks from. You only need to come here when Crawfords adds a new detector or accessory, or changes an address.

To add one, press **New** and fill in:

- **Product name.** As it should read on the buy button, e.g. "Minelab Excalibur II".
- **Short ID.** Lower-case letters, numbers and dashes only, e.g. `excalibur-2`. It becomes the file name, so pick it once and leave it.
- **Crawfords page path.** Only the part after `crawfordsmd.com`, starting with a slash: `/minelab-excalibur-ii`. The tracking code is added by the site, so don't type it in. (If you paste the full address from your browser by mistake, the site now tidies it up, but the short form is what the box expects.)
- **Crawfords comparison articles.** Optional links shown under the buy button. Same rule: paths only, e.g. `/blog/minelab-equinox-900-vs-minelab-manticore` or `/minelab-vanquish-560`, with a short label such as "Vanquish 560".
- **Category.** Detector, pinpointer, coil, accessory or digging.
- **Image.** Optional. Upload a product photo or pick one already on the site.
- **Show automatically on pages about…** Optional. One or more words separated by a `|` bar. The site offers the product on any page or post whose title contains one of the words, capitals ignored. Examples to copy: `excalibur`, `accessories|scoop|beach`, `vanquish|simplex`, `gold monster|prospect`. A page shows up to three matching products (a blog post two), detectors first and then by the Order number, so give your most important products the lowest Order. Leave it blank if you only want to place the product by hand with Insert → Product box.
- **Order.** Optional. Lower numbers come first in lists. Leave it blank for "doesn't matter".

Press **Save**. The product is in the Product box list straight away, in any post you open or are editing. The box itself appears on the site after the usual rebuild.

## Settings

**Settings** holds the bits that appear everywhere: the discount code and where it applies, the affiliate disclosure line, the homepage headline and photo, and the subscriber and video counts shown in the header. Edit, save, and they update across the site.

**Homepage photo.** Under Homepage, pick or upload a landscape photo (at least 1200px wide, a phone photo is fine) and save. Leave it empty to keep the current one.

**Search engine verification codes** (at the bottom of Settings) hold the Google Search Console and Bing Webmaster Tools codes. They are already filled in from the old site, so both tools stay verified. Only touch them if Google or Bing asks you to verify the site again: paste just the code from inside `content="..."` of the tag they give you.

## Telling Google and Bing about changes

You don't have to. After every save the site pings Bing (and the other search engines that use the same "IndexNow" system) with the list of pages that changed, and Google follows the sitemap, which is updated on every save too. New or changed pages normally show up in Google within a few days and in Bing within hours.

If a particular page matters and you want Google to look at it sooner, open Search Console, paste the page's address into the search bar at the top (URL Inspection) and press **Request indexing**. That is the only manual step there is, and it's optional.

## Pictures and files

Click **Assets** at the top of the editor to see every picture on the site, upload new ones, or find one to reuse. Uploads are converted to a web format automatically. Try to name files sensibly before uploading ("manticore-beach-settings.jpg" rather than "IMG_4471.jpg").

## Undo and backups

- **Undo one change.** Open the page or post and use the **History** panel on the right. Pick an earlier version and save it.
- **See every change.** Site tools, "See all changes".
- **Backups.** A full copy of all content and pictures is made every Sunday night, and you can make one any time from Site tools. Download one as a zip to keep on your own computer.
- **Restore.** From Site tools, "Restore a backup", type the backup name (for example `backup-2026-10-04`) and run it. Everything goes back to that day. The restore itself can be undone by restoring a newer backup.

## Who can edit

Anyone who edits needs a free GitHub account. The site owner (Ved's account, `ved9871`, until it is moved to Paul's) adds them from Site tools, "Invite or remove an editor":

1. Press **Add people**.
2. Enter their GitHub username or email.
3. Choose the **Write** role.

They get an email invitation. Once accepted, they sign in at the editor like you. Remove someone from the same page and their sign-in stops working straight away.

Turn on two-factor authentication on your GitHub account (Settings, Password and authentication). It takes two minutes and keeps the site safe if your password ever leaks.

## If something goes wrong

- **The page didn't change.** Wait three minutes and reload. If it still hasn't, check the post isn't a draft or dated in the future.
- **Save button is grey or an error appears.** A required field is empty. Red text shows which.
- **A picture won't upload.** Files over 15 MB are refused. Shrink it or pick another.
- **Anything else.** Message Ved with the page name and what you did. Nothing you do in the editor can break the site permanently: it can always be restored.
