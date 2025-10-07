require "language/node"

class Skypilot < Formula
  desc "CLI and TUI for OpenAI's Sora 2 video generation API."
  homepage "https://github.com/gunta/skypilot#readme"
  url "https://registry.npmjs.org/skypilot/-/skypilot-0.2.0.tgz"
  sha256 "ddedf5c0de460c8ff359e512292b1c33de4e905d9c5d433f0dec5122631f29df"
  license "MIT"
  head "https://github.com/gunta/skypilot.git", branch: "main"

  depends_on "node"

  def install
    cd "package" do
      system "npm", "install", *Language::Node.local_npm_install_args(libexec)
    end
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    output = shell_output("#{bin}/skypilot --version")
    assert_match version, output
  end
end
