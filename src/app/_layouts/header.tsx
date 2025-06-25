import Link from "next/link";
import postService from "@/server/services/posts";
import AdminMenu from "../_components/admin/AdminMenu";
export default function Header() {
    return (
        <header className="site-header">
            <div className="admin-menu">
                <AdminMenu/>
            </div>
            <nav>
                {
                    postService.getTypes().map(type =>
                        <Link
                            href={`/${type}`}
                            className="link"
                            key={type}
                        >
                            {type}
                        </Link>
                    )
                }
            </nav>         
        </header>
    )
}