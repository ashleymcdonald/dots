#
# ~/.bashrc
#

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# If not running interactively, don't do anything
[[ $- != *i* ]] && return


source .aliases

source liquidprompt

screenfetch

