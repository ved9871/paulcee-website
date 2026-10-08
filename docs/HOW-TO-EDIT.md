# How to edit paulcee.co.uk

This is the editor guide for Paul. It covers everything you need day to day. Keep it open in a tab the first few times.

**The editor:** https://ved9871.github.io/paulcee-website/admin/
**Site tools (backups, undo, access):** https://ved9871.github.io/paulcee-website/admin/tools/

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
- **Pictures.** Click the picture icon. Upload from your computer or pick one already on the site. Photos are converted and shrunk automatically, so phone photos are fine. Add a short description in the "alt text" box: it's what Google and screen readers use.
- **Lists and quotes** are in the ¶ menu too.
- **Enter** makes a new paragraph.

### Insert menu: videos, buy boxes and ads

The **Insert** button on the toolbar adds the special blocks:

- **YouTube video.** Paste the video link or its ID and an optional title. The video shows as a clickable thumbnail that plays on the page.
- **Product box (Crawfords).** Pick the detector or accessory from the list. The site puts in the picture, the price line, the "Buy at Crawfords" button with your tracking link and the discount code. You never need to type a Crawfords link by hand.
- **AdSense slot.** Puts an ad at that point. Posts already get ads placed automatically, so you only need this if you want one in a particular spot.

Each block has a small form. Fill it in and keep typing underneath. The **x** on the block removes it.

### Tables and anything unusual

The editor doesn't have a table button yet. For a comparison table, or if something looks odd, click **Edit in Markdown** on the toolbar. That shows the raw text, where a table looks like this:

```
| Feature | M8 coil | M9 coil |
|---|---|---|
| Shape | Elliptical | Round |
```

Click the same button to go back to the normal view. If in doubt, leave the Markdown view alone and ask Ved.

## Editing a page

Pages are the fixed parts of the site: the detector guides, About, Contact, the rally page and so on.

1. Click **Pages**, then the page.
2. Edit the text the same way as a post.
3. Press **Save**.

Don't change a page's title casually: the detector guides are linked from the menus and from Crawfords. Ask Ved if a page needs renaming or removing.

## Rallies and events

**Rallies and events** holds the dates shown on the rally page and the homepage. Add one with **New**: name, date, where, a sentence or two, and a link if there is one (a Crawfords link gets your tracking added automatically). Past events drop off the homepage on their own and stay on the rally page under "Past".

## Products

**Products** is the list that the "Product box" picks from. Each one has the name, the Crawfords page it links to, a one-line blurb and the picture. You only need to come here when Crawfords adds a new detector or changes an address. The tracking code is added by the site; don't type it into the address.

## Settings

**Settings** holds the bits that appear everywhere: the discount code and where it applies, the affiliate disclosure line, the homepage headline, and the subscriber and video counts shown in the header. Edit, save, and they update across the site.

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
