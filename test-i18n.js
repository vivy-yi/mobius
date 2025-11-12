#!/usr/bin/env node

// Simple test for i18n translation loading
const fs = require('fs');
const path = require('path');

// Simulate the translation function from nav.js
function t(key, fallback = '', translations) {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return fallback;
        }
    }

    return value || fallback;
}

async function testTranslations() {
    console.log('Testing i18n translations...\n');

    try {
        // Load Japanese translations
        const jaTranslations = JSON.parse(fs.readFileSync('./i18n/ja.json', 'utf8'));
        const zhTranslations = JSON.parse(fs.readFileSync('./i18n/zh.json', 'utf8'));
        const enTranslations = JSON.parse(fs.readFileSync('./i18n/en.json', 'utf8'));

        console.log('✅ Translation files loaded successfully\n');

        // Test navigation translation keys
        const navKeys = [
            'navigation.nav-home',
            'navigation.nav-ai-legal',
            'navigation.nav-ai-crm',
            'navigation.nav-knowledge',
            'navigation.nav-professionals',
            'navigation.nav-education',
            'navigation.nav-other-services',
            'navigation.nav-lifestyle',
            'navigation.nav-community',
            'navigation.nav-labor',
            'navigation.nav-pet',
            'navigation.nav-tourism',
            'navigation.nav-stats',
            'navigation.nav-contact'
        ];

        console.log('🧪 Testing navigation translations:');

        navKeys.forEach(key => {
            const jaTranslation = t(key, '', jaTranslations);
            const zhTranslation = t(key, '', zhTranslations);
            const enTranslation = t(key, '', enTranslations);

            if (jaTranslation && zhTranslation && enTranslation) {
                console.log(`✅ ${key}:`);
                console.log(`   JA: ${jaTranslation}`);
                console.log(`   ZH: ${zhTranslation}`);
                console.log(`   EN: ${enTranslation}\n`);
            } else {
                console.log(`❌ ${key}: Missing translation(s)`);
                console.log(`   JA: ${jaTranslation || 'MISSING'}`);
                console.log(`   ZH: ${zhTranslation || 'MISSING'}`);
                console.log(`   EN: ${enTranslation || 'MISSING'}\n`);
            }
        });

        // Test the specific key that was failing
        const dropdownKey = 'navigation.nav-other-services';
        const jaDropdown = t(dropdownKey, '', jaTranslations);

        console.log('🎯 Testing the critical dropdown translation:');
        if (jaDropdown === 'その他サービス') {
            console.log(`✅ SUCCESS: '${dropdownKey}' correctly translates to '${jaDropdown}'`);
        } else {
            console.log(`❌ FAILURE: '${dropdownKey}' translates to '${jaDropdown}', expected 'その他サービス'`);
        }

    } catch (error) {
        console.error('❌ Error loading translation files:', error.message);
        process.exit(1);
    }
}

testTranslations();