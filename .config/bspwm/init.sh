#!/usr/bin/env bash
#
# Launches bspwm
#

# Append timestamp to both logs
timestamp=$(date +'%Y-%m-%d %H:%M:%S')

echo -e "---- STARTUP $timestamp ----" >> "$XDG_CACHE_HOME/bspwm/stdout"
echo -e "---- STARTUP $timestamp ----" >> "$XDG_CACHE_HOME/bspwm/stderr"

$CURRENT_THEME/bin/init

## feh --bg-fill "$HOME"/.wallpapers/1.png

xsetroot -cursor_name left_ptr&

fixTrackpad&

xrandr --dpi 144

stalonetray&

"$LOCAL_ETC/sxhkd/init.sh" "$LOCAL_ETC/sxhkd/sxhkdrc.bspwm" &
{ sleep 1; "$LOCAL_ETC/compton/init.sh" & } &

run_count=0

while true; do
  run_count=$((run_count+1))
  export BSPWM_COUNTER=$run_count
  bspwm > "$XDG_CACHE_HOME/bspwm/stdout" 2> "$XDG_CACHE_HOME/bspwm/stderr" || break
  killall -q bspc
done

# Kill off any children
ps x | egrep "(bspwmrc|lemonbar|lemonbuddy)" | awk '!/grep/ {print $1}' | xargs kill
