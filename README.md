pegg-upload
====================

Simple node server app with web front-end that enables:
* image uploading directly from client to an S3 bucket
* Blitline job creation and storing to same S3 bucket


## Dev

# Install

```bash
git clone https://github.com/auggernaut/pegg-upload.git
cd pegg-upload
npm install
```

# Setup

* copy the config.json.example to config.json
* update config.json with keys for blitline and aws


# Development

```bash
node main.js
```

# Usage
Load url in chrome: http://localhost:9998