import React, {useMemo, useState} from 'react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Battery,
    Bell,
    Book, BookIcon,
    Briefcase,
    Building,
    Calendar,
    Camera,
    Car,
    Check,
    Clock,
    Code,
    Coffee,
    Database,
    Download,
    Eye,
    Facebook,
    Gamepad2,
    Gift,
    Github,
    Globe,
    GraduationCap,
    Heart,
    Home,
    Info,
    Instagram,
    Linkedin,
    Lock, LucideIcon,
    Mail,
    MapPin,
    Minus,
    Monitor,
    Music,
    Palette,
    Pause,
    Phone,
    Plane,
    Play,
    Plus,
    Search,
    Settings,
    ShoppingBag,
    Smartphone,
    Star,
    Twitter,
    Upload,
    User,
    Users,
    Volume2,
    Wifi,
    X,
    Youtube
} from 'lucide-react';
import TextInput from '@/app/_components/input/TextInput';
import Select from "@/app/_components/input/select/Select";
import {DropdownOption} from "@/interfaces/components/input";
import Icon from "@/app/_components/display/Icon";

// Collection d'icônes populaires organisées par catégorie
const iconCategories = {
    'Communication': {
        Mail, Phone, Globe, Wifi, Smartphone, Monitor
    },
    'Social': {
        Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Users, User, Heart
    },
    'Navigation': {
        Home, MapPin, ArrowRight, ArrowLeft, Plus, Minus, X, Check
    },
    'Business': {
        Briefcase, Building, Calendar, Clock, Database, Settings
    },
    'Media': {
        Camera, Music, Play, Pause, Volume2, BookIcon, Palette
    },
    'Lifestyle': {
        Coffee, Car, Plane, Gift, ShoppingBag, Gamepad2, Star
    },
    'Tech': {
        Code, Download, Upload, Battery, Lock, Eye, Bell
    },
    'Education': {
        GraduationCap, Book, Search, Info, AlertCircle
    }
};

interface IconSelectProps {
    value?: string;
    onSelect: (iconName: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showTooltip?: boolean;
    disabled?: boolean;
    allowEmpty?: boolean;
}

export const IconSelect: React.FC<IconSelectProps> = (
    {
        value,
        onSelect,
        label = "Select icon",
        placeholder = "Choose an icon...",
        className = "",
        size = "md",
        showTooltip = true,
        disabled = false,
        allowEmpty = true
    }) => {
    const [searchQuery, setSearchQuery] = useState("");

    // Flatten all icons with their names and components
    const allIcons = useMemo(() => {
        const icons: { name: string; component: (LucideIcon | React.ReactNode); category: string }[] = [];

        // Add empty option if allowed
        if (allowEmpty) {
            icons.push({name: '', component: <span className="dimmed text-xs">No icon</span>, category: 'None'});
        }

        Object.entries(iconCategories).forEach(([category, categoryIcons]) => {
            Object.entries(categoryIcons).forEach(([name, component]) => {
                icons.push({name, component, category});
            });
        });
        return icons;
    }, [allowEmpty]);

    // Filter icons based on search
    const filteredIcons = useMemo(() => {
        if (!searchQuery) return allIcons;
        return allIcons.filter(icon =>
            icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            icon.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allIcons, searchQuery]);

    // Convert icons to select options
    const selectOptions: DropdownOption[] = useMemo(() => {
        return filteredIcons.map(({name, component, category}) => ({
            value: name,
            label: name || 'No icon',
            option: (
                <div className="flex items-center gap-xs">
                    <div className="flex-center w-4 h-4">
                        <Icon icon={component}></Icon>
                    </div>
                    <span className="text-sm flex-1">{name || 'No icon'}</span>
                    <span className="text-xs dimmed">{category}</span>
                </div>
            )
        }));
    }, [filteredIcons]);

    return (
        <div className={`icon-select-wrapper ${className}`}>
            {/* Search input for filtering */}
            <div className="flex flex-col gap-xs">
                <TextInput
                    value={searchQuery}
                    label="Search"
                    onChange={setSearchQuery}
                    placeholder="Search icons..."
                    size="sm"
                    showTooltip={false}
                />

                {/* Select component with filtered options */}
                <Select
                    value={value || ''}
                    onChange={onSelect}
                    options={selectOptions}
                    label={label}
                    placeholder={placeholder}
                    size={size}
                    showTooltip={showTooltip}
                    disabled={disabled}
                    className="icon-select"
                />
            </div>
        </div>
    );
};

export default IconSelect;