import { App, ActionHandlerArgs, blocks } from '@aacebo/echo';
import { GiphyFetch } from '@giphy/js-fetch-api';

export function search(app: App, giphy: GiphyFetch) {
  return async ({ session_id, chat, value, ack }: ActionHandlerArgs<'input'>['chat']) => {
    const gifs = await giphy.search(value.text || ' ', {
      type: 'gifs',
      explore: true,
      limit: 15
    });

    let idx = 0;
    const rows: blocks.Row[] = [];

    for (let i = 0; i < 5; i++) {
      const row: blocks.Row = {
        type: 'row',
        children: []
      };

      while (idx < gifs.data.length) {
        row.children.push({
          type: 'button',
          child: {
            type: 'image',
            url: gifs.data[idx].images.fixed_width_downsampled.url
          },
          on_click: {
            action: 'submit',
            value: gifs.data[idx].images.fixed_width_downsampled.url
          }
        });

        idx++;

        if (idx % 3 == 0) {
          rows.push(row);
          break;
        }
      }
    }

    try {
      await app.api.views.dialogs.open(session_id, {
        id: 'giphy',
        type: 'chat',
        context_id: chat.id,
        title: {
          type: 'text',
          text: 'Random Gif'
        },
        body: {
          type: 'column',
          children: [
            {
              type: 'container',
              padding: {
                left: 10,
                right: 10,
                bottom: 10
              },
              child: {
                type: 'input',
                placeholder: {
                  type: 'text',
                  text: 'Search...'
                },
                default_value: value.text,
                on_submit: {
                  action: 'search'
                }
              }
            },
            {
              type: 'scroll',
              child: {
                type: 'column',
                children: rows
              }
            }
          ]
        }
      });
    } catch (err) {
      app.log(err);
    }

    ack();
  };
}
