
  # Website Builder

  This is a code bundle for Website Builder. The original project is available at https://www.figma.com/design/WpjQ5VT4ksLBPuOP3Atnm6/Website-Builder.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
# ArbiFans

## Backend Integration
This project is integrated with the ArbiFans backend (default: `https://backend-dev-new.vercel.app`).

### Configuration
- Base URL is defined in `src/config.ts`.
- To override, set `VITE_API_BASE_URL` in your `.env` file.

### Manual Test Flow
1. **Register Creator**: Go to "Creator Studio" in sidebar, enter name/wallet. Success redirects to asset submission.
2. **Submit Asset**: Enter details (image URL, price, description). Success redirects to "Gallery".
3. **Gallery**: Verify new asset appears in the list.
4. **Detail**: Click an asset to view full details.

### Storage
- Creator ID is stored in `localStorage` under `arbifans_creator_id`.