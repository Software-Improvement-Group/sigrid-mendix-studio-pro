# QSM integration for Mendix Studio Pro

A Mendix Studio Pro extension that integrates [Quality and Security Management](https://docs.mendix.com/appstore/partner-solutions/qsm/)
directly into your development environment.

## Prerequisites

- Mendix Studio Pro 11.7.0 or higher
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

### 2. Configure App Path

Edit `config.mjs` and set your Mendix app directory path and Studio Pro version:

```javascript
// 1. The path to your Mendix project folder
// Windows example: "C:\\Users\\username\\Mendix\\MyApp" (Note the double backslashes)
// macOS example: "/Users/username/Mendix/MyApp"
export const appDir = "/path/to/your/Mendix/App";

// 2. The Studio Pro version you are using (e.g. "11.7.0")
export const studioProVersion = "11.7.0";

// 3. macOS only: The name of your Studio Pro application in /Applications
// Example: "Studio Pro 11.7.0" or "Studio Pro 11.7.0 Beta"
export const studioProApp = "Studio Pro 11.7.0"; 
```

This configuration is used for both building the extension and launching Studio Pro.

### 3. Build

```bash
npm run build        # Build once
npm run build:dev    # Build with watch mode
```

### 4. Launch Studio Pro

You can now launch Studio Pro directly using the configured path:

```bash
npm start
```

This will automatically find the `.mpr` file in your `appDir` and enable extension development mode.

## Configuration

1. Locate the **Extensions** menu in Studio Pro's main menu bar.
2. Select **QSM** > **QSM Settings**.
3. Enter your Sigrid/QSM credentials:
   - **Customer**: Your Sigrid customer name
   - **System**: Your Sigrid system name
   - **Token**: Your [Sigrid API token](https://docs.sigrid-says.com/organization-integration/authentication-tokens.html)
4. Click **Save settings**

## Usage

1. Locate the **Extensions** menu in Studio Pro's main menu bar.
2. Select **QSM** > **Show QSM findings**.
3. View findings in the dockable pane:
   - **Scope Selector**: Filter findings between the **Entire system** or the **Selected file** currently open in Studio Pro.
   - **Navigation**: **Double-click** any blue finding to automatically open and focus the corresponding document in the Studio Pro editor. Non-clickable findings are displayed in standard black text.
4. Use the **Reload data** button to refresh findings from Sigrid.

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
