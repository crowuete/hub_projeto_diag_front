import { Instagram } from "lucide-react";

export default function Footer() {
    return (
        <>
            <footer className="w-full pt-8 p-2 bg-off-white dark:bg-midnight-blue border-t border-midnight-blue dark:border-blue-darknut text-center">
                <a className="text-sky-500">
                    hub@uem.br
                </a>
                <p className="my-5 leading-normal">
                    Universidade Estadual de Maringá
                    <br />
                    Bloco A01, Sala 14
                    <br />
                    Maringá, PR, Brasil
                </p>
                <nav>
                    <a className="inline-flex items-center hover:text-blue-darknut">
                        <Instagram />
                    </a>
                </nav>
            </footer>
        </>
    );
}