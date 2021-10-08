// Copyright (c) 2021 edu
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const yesno = require('yesno');

const questions = [
    {
        question: 'Before publishing, you need to generate new documents, did you? (y/n):',
        defaultValue: 'n'
    }
];

(async () => {
    for(const element of questions){
        const ok = await yesno(element);
        if(!ok){
            console.error("Please realize all flow correctly");
            process.exit(1);
        }
    }
})()