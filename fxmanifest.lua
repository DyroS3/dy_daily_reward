fx_version 'cerulean'
game 'gta5'

name 'dy_daily_reward'
description '每日签到奖励系统'
author 'DingYu'
version '1.0.0'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/index.js',
    'web/dist/assets/index.css',
    'web/images/**/*.png',
    'web/images/**/*.webp',
    'web/game-reward.ogg'
}
