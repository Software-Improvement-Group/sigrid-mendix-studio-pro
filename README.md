# QSM integration for Mendix Studio Pro

A Mendix Studio Pro extension that integrates [Quality and Security Management](https://docs.mendix.com/appstore/partner-solutions/qsm/)
directly into your development environment.

## Prerequisites

- Mendix Studio Pro 11.2.0 or higher
- Node.js 22.x or higher
- You have a Sigrid account
- You have a [Sigrid API token](https://docs.sigrid-says.com/organization-integration/authentication-tokens.html)

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

1. Locate the "extensions" menu in Studio Pro's main menu bar.
2. Select the "QSM extension".
3. Select "QSM settings".
4. Enter your Sigrid credentials:
   - **Token**: Your [Sigrid API token](https://docs.sigrid-says.com/organization-integration/authentication-tokens.html)
   - **Customer**: Your Sigrid customer name
   - **System**: Your Sigrid system name
5. Click **Save settings**

## Usage

1. Locate the "extensions" menu in Studio Pro's main menu bar.
2. Select the "QSM extension".
3. Select "Show QSM findings".
4. Click **Load/refresh findings**
5. View findings in the table

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
