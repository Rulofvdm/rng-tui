{
  description = "rng-tui development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            (writeShellScriptBin "ng" ''
              exec npx -y @angular/cli "$@"
            '')
          ];

          shellHook = ''
            export npm_config_prefix="$PWD/.npm-global"
            export PATH="$npm_config_prefix/bin:$PATH"
          '';
        };
      });
}
