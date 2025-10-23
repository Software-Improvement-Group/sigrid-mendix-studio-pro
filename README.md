# Sigrid for Mendix Studio Pro

A Mendix Studio Pro extension that integrates Sigrid findings directly into your development environment.

## Features

- View findings from Sigrid in a dockable pane
- Configure Sigrid API credentials (token, customer, system)
- Real-time data fetching from Sigrid API

## Prerequisites

- Mendix Studio Pro 11.2.0 or higher
- Node.js 22.x or higher
- Sigrid account with API access

## Installation

### 1. Clone and Install

```bash
git clone https://github.com/Software-Improvement-Group/sigrid-mendix-studio-pro.git
cd sigrid-mendix-studio-pro
npm install
```

### 2. Configure Build Path

Edit `build-extension.mjs` and set your Mendix app path:

```javascript
const appDir = "/path/to/your/Mendix/App";
```

### 3. Build

```bash
npm run build        # Build once
npm run build:dev    # Build with watch mode
```

### 4. Launch Studio Pro

**macOS:**

```bash
# Replace version number with your installed version
/Applications/Studio\ Pro\ <VERSION>.app/Contents/MacOS/studiopro \
  --enable-extension-development \
  "/path/to/your/App.mpr"
```

**Windows:**

```powershell
"C:\Program Files\Mendix\11.2.0\modeler\studiopro.exe" ^
  --enable-extension-development ^
  "C:\path\to\your\App.mpr"
```

## Configuration

1. In Studio Pro, go to **Extensions** → **QSM** → **QSM Settings**
2. Enter your Sigrid credentials:
   - **Token**: Your Sigrid API token
   - **Customer**: Your customer name
   - **System**: Your system name
3. Click **Save settings**

Find your credentials in your Sigrid project URL: `https://sigrid-says.com/<customer>/<system>`

## Usage

1. **Extensions** → **QSM** → **Show QSM findings**
2. Click **Load/refresh findings**
3. View findings in the table

## Development

### Project Structure

```
src/
├── main/index.ts              # Extension entry point
├── ui/
│   ├── tab/index.tsx          # Settings UI
│   └── dockablepane/index.tsx # Findings UI
└── manifest.json              # Extension manifest
```

## API

Uses Sigrid API endpoint:

```
GET https://sigrid-says.com/rest/analysis-results/api/v1/security-findings/{customer}/{system}
Authorization: Bearer {token}
```

For more information on the Sigrid API: [Sigrid API Documentation](https://docs.sigrid-says.com/integrations/sigrid-api-documentation.html)

## Contact and Support

Feel free to contact [SIG's support team](mailto:support@softwareimprovementgroup.com) for any questions or issues you may have after reading this document, or when using Sigrid or Sigrid CI. Users in Europe can also contact us by phone at +31 20 314 0953.

## License

Copyright Software Improvement Group

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

## Resources

- [Mendix Web Extensibility API Documentation](https://docs.mendix.com/apidocs-mxsdk/apidocs/web-extensibility-api-11/)
- [Sigrid Documentation](https://docs.sigrid-says.com/)
