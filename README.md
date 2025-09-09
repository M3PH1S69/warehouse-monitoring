# Warehouse Monitoring System

A modern web-based warehouse management system built with React, TypeScript, and Tailwind CSS. This application provides comprehensive inventory tracking, device management, and transaction monitoring capabilities.

## 🚀 Features

- **Device Management**: Add, edit, and track warehouse devices with detailed information
- **Inventory Tracking**: Real-time stock monitoring with status indicators
- **Transaction History**: Complete audit trail of all inventory movements
- **User Management**: Role-based access control (Administrator/Staff)
- **Dark Mode**: Full dark theme support
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live inventory status updates
- **Export Capabilities**: Data export functionality
- **Search & Filter**: Advanced filtering and search options

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Charts**: Chart.js + React Chart.js 2
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Hooks + Context API
- **Development**: ESLint + TypeScript

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd warehouse-monitoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Build for production**
   ```bash
   npm run build
   # or
   pnpm build
   ```

## 🚀 Deployment

### Static Deployment (Nginx/Apache)

The application is configured for static deployment with relative paths.

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your web server

3. **Nginx Configuration Example**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Build Output Structure
```
dist/
├── index.html                    # Main entry point
├── assets/
│   ├── css/
│   │   └── index-[hash].css     # Compiled CSS with Tailwind
│   └── js/
│       ├── index-[hash].js      # Main application bundle
│       ├── vendor-[hash].js     # Third-party libraries
│       ├── router-[hash].js     # React Router bundle
│       └── charts-[hash].js     # Chart.js library
```

## 👥 User Roles

### Administrator
- Full system access
- User management
- Device CRUD operations
- Transaction management
- System configuration

### Staff
- View inventory
- Create transactions
- Limited device operations
- Read-only user access

## 🔐 Authentication

The system includes a demo authentication system:

**Administrator Login:**
- Username: `admin`
- Password: `admin123`

**Staff Login:**
- Username: `staff`  
- Password: `staff123`

## 📱 Usage

### Device Management
1. Navigate to **Devices** section
2. Click **Add Device** to create new entries
3. Use **Edit** to modify existing devices
4. Monitor stock levels with status indicators

### Transaction Processing
1. Go to **Transactions** section
2. Select **IN** for incoming inventory
3. Select **OUT** for outgoing inventory
4. Fill required details and submit

### User Management (Admin Only)
1. Access **Users** section
2. Add new users with appropriate roles
3. Edit existing user permissions
4. Monitor user activity

## 🎨 Customization

### Themes
- Light/Dark mode toggle available
- Custom CSS classes in `src/index.css`
- Tailwind configuration in `tailwind.config.js`

### Configuration
- UI text constants in `constants.ts`
- Mock data in `data/mockData.ts`
- Type definitions in `types.ts`

## 📊 Data Structure

### Device Interface
```typescript
interface Device {
  id: string;
  name: string;
  category: string;
  brand: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  condition: 'Normal' | 'Rusak';
  description?: string;
  registrationNumbers?: string[];
}
```

### Transaction Interface
```typescript
interface Transaction {
  id: string;
  deviceId: string;
  deviceName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  user: string;
  destination?: string;
  recipient?: string;
  source?: string;
  sender?: string;
  registrationNumbers?: string[];
}
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:production` - Build with full optimization
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── data/               # Mock data and constants
├── types.ts            # TypeScript type definitions
├── constants.ts        # Application constants
└── index.css          # Global styles
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for React + TypeScript
- Prettier integration recommended
- Tailwind CSS for styling

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Ensure Node.js 18+ is installed
   - Clear `node_modules` and reinstall dependencies
   - Check TypeScript errors with `npm run build`

2. **Styles Not Loading**
   - Verify Tailwind CSS configuration
   - Check PostCSS configuration
   - Ensure CSS imports are correct

3. **Routing Issues**
   - Verify React Router configuration
   - Check base path in `vite.config.ts`
   - Ensure server supports SPA routing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

---

**Version**: 2.0.0  
**Last Updated**: September 2025  
**Status**: Production Ready ✅