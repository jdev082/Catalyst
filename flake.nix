{
  description = "A Nix-flake-based Node.js development environment";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1.*.tar.gz";

  outputs = { self, nixpkgs }:
    let
      overlays = [
        (final: prev: rec {
          nodejs = prev.nodejs_latest;
          pnpm = prev.nodePackages.pnpm;
        })
      ];
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs { inherit overlays system; };
      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          shellHook = ''
            export LD_LIBRARY_PATH=${pkgs.glib.out}/lib:${pkgs.nss.out}/lib:${pkgs.nspr.out}/lib:${pkgs.dbus.lib}/lib:${pkgs.atk.out}/lib:${pkgs.cups.lib}/lib:${pkgs.libdrm.out}/lib:${pkgs.gtk3.out}/lib:${pkgs.pango.out}/lib:${pkgs.cairo.out}/lib:${pkgs.xorg.libX11.out}/lib:${pkgs.xorg.libXcomposite.out}/lib:${pkgs.xorg.libXdamage.out}/lib:${pkgs.xorg.libXext.out}/lib:${pkgs.xorg.libXfixes.out}/lib:${pkgs.xorg.libXrandr.out}/lib
          '';
          packages = (with pkgs;
            [
              nodejs python3 libcxx systemd libpulseaudio libdrm mesa stdenv.cc.cc
              alsa-lib atk at-spi2-atk at-spi2-core cairo cups dbus dbus-glib expat fontconfig
              freetype gdk-pixbuf glib glibc gtk3 libnotify libuuid nspr nss pango systemd
              libappindicator-gtk3 libdbusmenu libxkbcommon zlib
            ]
          ) ++ (with pkgs.xorg;
          [
            libXScrnSaver libXrender libXcursor libXdamage libXext libXfixes libXi
            libXrandr libX11 libXcomposite libxshmfence libXtst libxcb
          ]
          );
        };
      });
    };
}
