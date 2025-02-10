"use client";

import { useState } from "react";
import { SimplePool, nip19 } from "nostr-tools";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link"; // Importamos Link de Next.js

export default function NostrClient() {
  const [notes, setNotes] = useState<any[]>([]);
  const [npub, setNpub] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false); // Estado para controlar la visibilidad del QR

  const pool = new SimplePool();
  const relays = [
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.snort.social",
  ];
  // Define el componente GitHubLogo
  const GitHubLogo = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );

  // Función para restablecer el estado inicial
  const resetState = () => {
    setNpub(""); // Borra el npub
    setStartDate(""); // Reinicia la fecha de inicio
    setEndDate(""); // Reinicia la fecha de fin
    setNotes([]); // Limpia las notas
    setIsLoading(false); // Detiene la carga si estaba activa
    setShowQR(false); // Cierra el QR si estaba abierto
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setNotes([]);
    try {
      const npubRegex = /^npub1[ac-hj-np-z02-9]{58}$/;
      if (!npubRegex.test(npub)) {
        alert("Invalid npub format");
        return;
      }

      const { type, data: pubkey } = nip19.decode(npub);
      if (type !== "npub") {
        throw new Error("Invalid npub");
      }

      const since = startDate
        ? Math.floor(new Date(startDate).getTime() / 1000)
        : 0;
      const until = endDate
        ? Math.floor(new Date(endDate).getTime() / 1000)
        : undefined;

      const events = await pool.querySync(relays, {
        kinds: [1],
        authors: [pubkey],
        since,
        until,
      });

      // Reemplazar nprofile con nombres de usuario
      const notesWithUsernames = await Promise.all(
        events.map(async (note) => {
          const contentWithUsernames = await replaceNprofileWithUsername(
            note.content
          );
          return { ...note, content: contentWithUsernames };
        })
      );

      setNotes(notesWithUsernames);
    } catch (error) {
      console.error("Error searching for npub:", error);
      alert("Error searching for npub. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const extractMediaUrls = (content: string) => {
    const urlRegex = /https?:\/\/\S+\.(jpg|jpeg|png|gif|mp4|webp|mov|avi)/gi;
    return content.match(urlRegex) || [];
  };

  const getUserName = async (pubkey: string) => {
    try {
      const events = await pool.querySync(relays, {
        kinds: [0],
        authors: [pubkey],
        limit: 1,
      });

      if (events.length > 0) {
        const metadata = JSON.parse(events[0].content);
        return metadata.name || "Unknown User";
      }
    } catch (error) {
      console.error("Error fetching user metadata:", error);
    }
    return "Unknown User";
  };

  const replaceNprofileWithUsername = async (content: string) => {
    const nprofileRegex = /nostr:nprofile1[ac-hj-np-z02-9]+/g;
    const matches = content.match(nprofileRegex) || [];

    for (const match of matches) {
      try {
        const { type, data } = nip19.decode(match.replace("nostr:", ""));
        if (type === "nprofile") {
          const username = await getUserName(data.pubkey);
          content = content.replace(match, `@${username}`);
        }
      } catch (error) {
        console.error("Error decoding nprofile:", error);
      }
    }

    return content;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-violet-900 p-4">
      {/* Envolvemos el título en un div con onClick para resetear el estado */}
      <div onClick={resetState} className="cursor-pointer">
        <h1 className="text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-500 to-pink-400">
          Nostr0
        </h1>
      </div>
      <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg text-violet-200 border-violet-500/20 mt-6">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-center text-violet-300">
            Find your event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4 mb-6">
            <Input
              type="text"
              placeholder="Enter npub..."
              value={npub}
              onChange={(e) => setNpub(e.target.value)}
              className="flex-grow bg-gray-800/50 text-violet-200 placeholder-gray-500 border-gray-700"
              aria-label="Enter npub"
            />
            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-grow bg-gray-800/50 text-violet-200 placeholder-gray-500 border-gray-700"
              aria-label="Start date"
            />
            <Input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-grow bg-gray-800/50 text-violet-200 placeholder-gray-500 border-gray-700"
              aria-label="End date"
            />
            <div className="flex justify-center w-full">
              <Button
                onClick={handleSearch}
                className="bg-violet-600 hover:bg-violet-700 transition-colors"
                disabled={isLoading}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
            </div>
          )}

          {/* Mostrar las notas */}
          <div className="space-y-4">
            {notes.map((note) => {
              const mediaUrls = extractMediaUrls(note.content);
              return (
                <div
                  key={note.id}
                  className="bg-gray-800/30 p-4 rounded-lg border border-violet-500/20 backdrop-blur-sm overflow-hidden"
                >
                  <p className="text-sm text-gray-400 mb-2">
                    {formatDate(note.created_at)}
                  </p>
                  <p className="text-gray-300 leading-relaxed break-words">
                    {note.content}
                  </p>
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="mt-4">
                      {url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                        <video
                          src={url}
                          controls
                          className="rounded-lg max-w-full"
                        ></video>
                      ) : (
                        <img
                          src={url}
                          alt="Attached media"
                          className="rounded-lg max-w-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <div className="text-right mt-4">
                    <a
                      href={`https://njump.me/${note.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-pink-400 transition-colors underline"
                    >
                      Open
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mostrar el código QR */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-center text-violet-300 mb-4">
              Scan to ZAP
            </h2>
            <div className="flex justify-center">
              <QRCodeSVG
                value="negr0@lawallet.ar"
                size={256}
                bgColor="transparent"
                fgColor="#ffffff"
              />
            </div>
            <p className="mt-4 text-sm text-center text-gray-400">
              Scan this QR code to send sats to negr0@lawallet.ar.
            </p>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowQR(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rayito ⚡️ para abrir el QR */}
      <div className="text-center mt-8">
        <span
          className="text-yellow-400 cursor-pointer"
          onClick={() => setShowQR(true)}
        >
          Zap me ⚡️
        </span>
      </div>

      <div className="flex items-center justify-center mt-8 text-violet-400 text-sm">
        <span>By</span>
        <a
          href="https://nosta.me/20d29810d6a5f92b045ade02ebbadc9036d741cc686b00415c42b4236fe4ad2f"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 font-semibold underline hover:text-pink-400 transition-colors"
        >
          negr0
        </a>
        <img
          src="/avestruz.png" // Asegúrate de que la ruta sea correcta
          alt="Logo"
          className="ml-2 h-6 w-6" // Ajusta el tamaño según sea necesario
        />
        {/* Agrega el ícono de GitHub aquí */}
        <a
          href="https://github.com/Negr087/Nostr0" // Reemplaza con la URL de tu repositorio
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-violet-400 hover:text-pink-400 transition-colors"
        >
          <GitHubLogo />
        </a>
        <span className="ml-2 text-yellow-400"></span>
        <span className="ml-2 text-yellow-400"></span>
      </div>
    </div>
  );
}
