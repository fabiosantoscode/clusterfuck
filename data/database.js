/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Model types
export class Game {}
export class Tag {}

// Mock data
const game = new Game();
game.id = '1';

const hidingSpots = [];
const tags = [];
(function() {
  let tag;
  for (let i = 0; i < 9; i++) {
    tag = new Tag();
    tag.id = `tag-${i}`;
    tag.source = 'source code ' + i
    tags.push(tag);
  }
})();

export function getGame() { return game; }

export function getTag(id) {
  return tags.find(tag => tag.id === id)
}
export function addTag({ source }) {
  tags.push({
    source
  })
  var id = tags.length;
  tags[tags.length - 1].id = tags.length
  return id
}
export function getTags() { return tags }
