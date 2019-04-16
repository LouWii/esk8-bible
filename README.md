# Esk8 Bible

A small Craft CMS site project about electric skateboards or _esk8_.

## Install

Clone this repo

```
git clone https://github.com/LouWii/esk8-bible.git
```

Install PHP dependencies

```
cd esk8-bible
composer install
```

Set proper permissions to app folders (need to be writable by the app)

```
chmod 777 storage
chmod 777 web/cpresources
```

Install frontend dependencies

```
cd web
npm install
```

## Developers

### Frontend css and JS

Run `gulp sass` to compile sass files to css

Run `gulp scripts` to build all JS.