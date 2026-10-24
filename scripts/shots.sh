#!/bin/zsh
# Builds static/shots from raw app screenshots: every device shot framed in Apple's product bezel,
# flattened into one WebP (the bezels themselves are never shipped on their own), plus a few crops.
#
# usage: scripts/shots.sh <raw dir> <bezel dir>
#   <raw dir>    iphone/, iphone-dark/, ipad/, ipad-dark/, mac/, mac-dark/ with the PNGs named below
#   <bezel dir>  Apple Design Resources PNGs: iphone18promax-black.png, ipadpro13-spaceblack.png,
#                macbookair13-midnight.png (https://developer.apple.com/design/resources/#product-bezels)
#
# Raw shots: iPhone 17 Pro Max simulator (1320×2868), iPad Pro 13" (M5) simulator (2064×2752), Mote on the Mac
# with `-windowSize 1280x832` (2560×1664). How they are taken: Design/AppStore/README.md in the app repo.
# Needs swiftc, sips and cwebp. Intermediate PNGs go to a temp folder that is removed at the end.
set -e
RAW=${1:A}; BEZ=${2:A}
ROOT=${0:A:h:h}; OUT=$ROOT/static/shots
TMP=$(mktemp -d); trap 'rm -rf $TMP' EXIT
swiftc -O $ROOT/scripts/frame.swift -o $TMP/frame

webp() { cwebp -quiet -q ${3:-82} -resize $2 0 $1 -o $OUT/$4.webp; }

iphone() { # <raw png> <name>
  $TMP/frame $BEZ/iphone18promax-black.png $RAW/$1 $TMP/f.png 75 66 1320 2868 180 180 180 180
  webp $TMP/f.png 720 82 $2
}
ipad() {
  $TMP/frame $BEZ/ipadpro13-spaceblack.png $RAW/$1 $TMP/f.png 118 124 2064 2752 52 52 52 52
  webp $TMP/f.png 1200 82 $2
}
mac() {
  $TMP/frame $BEZ/macbookair13-midnight.png $RAW/$1 $TMP/f.png 420 288 2560 1664 30 30 0 0 1C1C1E
  webp $TMP/f.png 2000 84 $2
}
crop() { # <raw png> <x> <y> <w> <h> <name> <width>
  sips -c $5 $4 --cropOffset $3 $2 $RAW/$1 --out $TMP/c.png >/dev/null
  webp $TMP/c.png $7 86 $6
}

mkdir -p $OUT
[[ -d $RAW/iphone ]] && {
  iphone iphone/01-inbox.png iphone-inbox
  iphone iphone/02-pages.png iphone-pages
  iphone iphone/03-reading.png iphone-reading
  iphone iphone/04-seminar.png iphone-seminar
  iphone iphone/05-ask.png iphone-ask
  iphone iphone/06-viewing.png iphone-viewing
  iphone iphone/07-mail.png iphone-mail
}
[[ -d $RAW/iphone-dark ]] && {
  iphone iphone-dark/03-books.png iphone-books-dark
  iphone iphone-dark/06-viewing.png iphone-viewing-dark
}
[[ -d $RAW/ipad ]] && {
  ipad ipad/01-inbox.png ipad-inbox
  ipad ipad/04-viewing.png ipad-viewing
  ipad ipad/05-seminar.png ipad-seminar
  # Cards for the integrations: the event, the mail and the reminders of "Apartment viewing" (iPad, 2x).
  crop ipad/04-viewing.png 650 424 1174 228 card-event 1174
  crop ipad/04-viewing.png 650 732 1174 258 card-mail 1174
  crop ipad/04-viewing.png 650 1387 1174 333 card-reminders 1174
}
[[ -d $RAW/ipad-dark ]] && ipad ipad-dark/02-books.png ipad-books-dark
[[ -d $RAW/mac ]] && for f in $RAW/mac/*.png; do mac mac/${f:t} mac-${${f:t:r}#[0-9][0-9]-}; done
[[ -d $RAW/mac-dark ]] && for f in $RAW/mac-dark/*.png; do mac mac-dark/${f:t} mac-${${f:t:r}#[0-9][0-9]-}-dark; done
ls -la $OUT
