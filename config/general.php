<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 */

return [
    // Global settings
    '*' => [
        // Default Week Start Day (0 = Sunday, 1 = Monday...)
        'defaultWeekStartDay' => 0,

        // Enable CSRF Protection (recommended, will be enabled by default in Craft 3)
        'enableCsrfProtection' => true,

        // Whether "index.php" should be visible in URLs
        'omitScriptNameInUrls' => true,

        // Control Panel trigger word
        'cpTrigger' => 'admin',

        // The secure key Craft will use for hashing and encrypting data
        'securityKey' => getenv('SECURITY_KEY'),
    ],

    // Dev environment settings
    'dev' => [
        // Base site URL
        'siteUrl' => null,

        // Dev Mode (see https://craftcms.com/support/dev-mode)
        'devMode' => true,

        // More: https://craftcms.com/docs/multi-environment-configs#example-multi-environment-asset-source-settings
        // Doesn't work in Craft3 ?
        'aliases' => array(
            'basePath' => '/Users/louis/Documents/WebProjects/esk8/web/',
            'baseUrl'  => 'http://esk8.dev/',
        )
    ],

    // Staging environment settings
    'staging' => [
        // Base site URL
        'siteUrl' => 'http://esk8.louwii.fr',
    ],

    // Production environment settings
    'production' => [
        // Base site URL
        'siteUrl' => 'https://esk8bible.com',
    ],
];
