#!/usr/bin/env sh
#
# Defines runtime environment
#
export LOCAL_ETC="${HOME}/.local/etc"
export LOCAL_BIN="${HOME}/.local/bin"
export LOCAL_LIB="${HOME}/.local/lib"
export LOCAL_SRC="${HOME}/.local/src"
export LOCAL_VAR="${HOME}/.local/var"

export XDG_DATA_HOME="${HOME}/.local/share"
export XDG_CACHE_HOME="${HOME}/.cache"
export XDG_CONFIG_HOME="${HOME}/.config"

export LEMONBUDDY_HOME="${LOCAL_VAR}/github/jaagr/lemonbuddy"
export GITHUB_HOME="${LOCAL_VAR}/github"
export PERL_HOME="${LOCAL_VAR}/perl"

command -v perl >/dev/null && [ -e "${PERL_HOME}/lib/perl5/local/lib.pm" ] && {
  eval "$(perl -I"${PERL_HOME}/lib/perl5" -Mlocal::lib="${PERL_HOME}")"
}

export CURRENT_THEME="${LOCAL_ETC}/mytheme"

export BSPWMRC="${LOCAL_ETC}/bspwm/bspwmrc"
export BSPWM_STATE="${XDG_CACHE_HOME}/bspwm/state.json"
export BSPWM_FIFO="${XDG_CACHE_HOME}/bspwm/wm_state"

export SXHKD_SHELL="/usr/bin/bash"
export GOPATH="${LOCAL_SRC}/go"
export GIMP2_DIRECTORY="${XDG_CONFIG_HOME}/gimp"

export TORRENTS="/storage/data/torrents"
export MUSIC="/storage/media/music"
export MOVIES="/storage/media/music"
export WALLPAPERS="/storage/media/music"
export BACKUPS="/storage/backups"
export VAULT="/storage/vault"

export ARCH="x86_64"
export ARCHFLAGS="-arch x86_64"

export LANG="en_US.UTF-8"
export BROWSER="vimperator"
export EDITOR="vim"
export VISUAL="vim"

export PAGER="less"
export PERLDOC_PAGER="more"
export LESS="-g -i -M -R -S -w -K -z-4 --lesskey-file=${XDG_CONFIG_HOME}/lesskey"
export LESSHISTFILE="${XDG_CACHE_HOME}/.lesshst"
export GREP_COLORS="mt=30;43"

export GDK_DPI_SCALE=1.75 

export NOTMUCH_CONFIG="${XDG_CONFIG_HOME}/notmuch/config"
export GTK2_RC_FILES="${XDG_CONFIG_HOME}/gtk-2.0/gtkrc"
export WINEPREFIX="${XDG_DATA_HOME}/wine"
export NO_AT_BRIDGE=1
export QT_STYLE_OVERRIDE="GTK+"

export _JAVA_AWT_WM_NONREPARENTING=1

. "${LOCAL_ETC}/xorg/xenvironment"

[ "$TERM" = "xterm" ] && {
  export TERM="xterm-256color"
}

# Update PATH
path_prepend() {
  case ":$PATH:" in
    *":$1:"*) return ;; # already added
    *) PATH="$1:$PATH";;
  esac
}

[ -d "$LOCAL_LIB" ] && {
  for dir in "$LOCAL_LIB"/* "$LOCAL_LIB"; do
    [ -d "$dir" ] && path_prepend "$dir"
  done
}

[ -d "$LOCAL_BIN" ] && {
  for dir in "$LOCAL_BIN"/* "$LOCAL_BIN"; do
    [ -d "$dir" ] && path_prepend "$dir"
  done
}

[ -d "$GOPATH" ] && {
  path_prepend "$GOPATH/bin"
}

unset dir
unset -f path_prepend

export PATH


