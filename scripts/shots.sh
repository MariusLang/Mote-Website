#!/bin/zsh
# Builds static/shots from raw app screenshots: every device shot framed in Apple's product bezel,
# flattened into one WebP (the bezels themselves are never shipped on their own), plus a few crops.
#
# usage: scripts/shots.sh <raw dir> <bezel dir>
#   <raw dir>    iphone/, iphone-dark/, ipad/, mac/, mac-dark/ with the PNGs named below
#   <bezel dir>  Apple Design Resources PNGs: iphone18promax-black.png, ipadpro13-spaceblack.png,
#                macbookair13-midnight.png (https://developer.apple.com/design/resources/#product-bezels)
#
# Raw shots: iPhone 17 Pro Max simulator (1320×2868), iPad Pro 13" (M5) simulator (2064×2752), Mote on the Mac
# with `-windowSize 1280x795` (2560×1590: the MacBook Air screen below the menu bar). How they are taken:
# Design/AppStore/README.md in the app repo.
# Needs swiftc, sips and cwebp. Intermediate PNGs go to a temp folder that is removed at the end.
set -e
RAW=${1:A}; BEZ=${2:A}
ROOT=${0:A:h:h}; OUT=$ROOT/static/shots
TMP=$(mktemp -d); trap 'rm -rf $TMP' EXIT
swiftc -O $ROOT/scripts/frame.swift -o $TMP/frame
swiftc -O $ROOT/scripts/menubar.swift -o $TMP/menubar

webp() { cwebp -quiet -q ${3:-82} -resize $2 0 $1 -o $OUT/$4.webp; }
# A raw shot that is missing is skipped, so a single device can be shot again on its own.
have() { [[ -f $RAW/$1 ]] || { echo "skip $1"; return 1 }; }

iphone() { # <raw png> <name>
  have $1 || return 0
  $TMP/frame $BEZ/iphone18promax-black.png $RAW/$1 $TMP/f.png 75 66 1320 2868 180 180 180 180
  webp $TMP/f.png 720 82 $2
}
ipad() {
  have $1 || return 0
  $TMP/frame $BEZ/ipadpro13-spaceblack.png $RAW/$1 $TMP/f.png 118 124 2064 2752 52 52 52 52
  webp $TMP/f.png 1200 82 $2
}
mac() { # <raw png> <name> [menu bar hex] [light|dark]
  have $1 || return 0
  # the window sits below the 37 pt menu bar, which the notch cuts into
  $TMP/frame $BEZ/macbookair13-midnight.png $RAW/$1 $TMP/f.png 420 288 2560 1664 30 30 0 0 ${3:-E8E8ED} 74
  $TMP/menubar $TMP/f.png $TMP/f.png 420 288 2560 74 ${4:-light}
  webp $TMP/f.png 2000 84 $2
}
crop() { # <raw png> <x> <y> <w> <h> <name> <width>
  have $1 || return 0
  sips -c $5 $4 --cropOffset $3 $2 $RAW/$1 --out $TMP/c.png >/dev/null
  webp $TMP/c.png $7 86 $6
}

mkdir -p $OUT
[[ -d $RAW/iphone ]] && {
  iphone iphone/01-inbox.png iphone-inbox
  iphone iphone/02-pages.png iphone-pages
  iphone iphone/03-launch.png iphone-launch
  iphone iphone/04-seminar.png iphone-seminar
  iphone iphone/05-ask.png iphone-ask
  iphone iphone/06-kickoff.png iphone-kickoff
  iphone iphone/07-mail.png iphone-mail
}
[[ -d $RAW/iphone-dark ]] && {
  iphone iphone-dark/03-books.png iphone-books-dark
  iphone iphone-dark/06-kickoff.png iphone-kickoff-dark
}
[[ -d $RAW/ipad ]] && {
  ipad ipad/04-kickoff.png ipad-kickoff
  ipad ipad/08-talk.png ipad-talk
  # Cards for the integrations: the event, the mail and the reminders of "Kickoff with Northwind" (iPad, 2x).
  crop ipad/04-kickoff.png 664 450 1136 188 card-event 1136
  crop ipad/04-kickoff.png 664 766 1136 210 card-mail 1136
  crop ipad/04-kickoff.png 664 1420 1136 284 card-reminders 1136
  # The drawing block of "RAG talk", inside its card border.
  crop ipad/08-talk.png 676 744 1352 667 card-drawing 1200
}
[[ -d $RAW/mac ]] && for f in $RAW/mac/*.png; do mac mac/${f:t} mac-${${f:t:r}#[0-9][0-9]-}; done
[[ -d $RAW/mac-dark ]] && for f in $RAW/mac-dark/*.png; do mac mac-dark/${f:t} mac-${${f:t:r}#[0-9][0-9]-}-dark 1C1C1E dark; done
ls -la $OUT
