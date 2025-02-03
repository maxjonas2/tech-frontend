import Link from "next/link";
import { FiFile as FileIcon } from "react-icons/fi";

type RAGFile = {
  name: string;
  format: string;
  url: string;
};

const FilesCard = ({ files }: { files: RAGFile[] }) => {
  return (
    <section className="card transition-all duration-500 p-3 w-[616px] h-[200px] bg-slate-200 border-slate-300 border shadow-zinc-300 rounded-md">
      <h1 className="mb-2 font-bold">Arquivos</h1>
      <div>
        {files.map((file) => {
          return (
            <div>
              <Link href={file.url}>
                <div className="space-x-2">
                  <FileIcon className="inline-block" />
                  <p className="inline-block">{file.name}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FilesCard;
