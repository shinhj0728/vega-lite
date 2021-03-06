import {assert} from 'chai';
import {DETAIL, SHAPE, X} from '../../src/channel';
import {FieldDef} from '../../src/fielddef';
import * as log from '../../src/log';
import {BAR} from '../../src/mark';
import {QUANTITATIVE} from '../../src/type';
import {parseUnitModel} from '../util';

describe('UnitModel', () => {
  describe('initEncoding', () => {
    it(
      'should drop unsupported channel and throws warning',
      log.wrap(localLogger => {
        const model = parseUnitModel({
          mark: 'bar',
          encoding: {
            shape: {field: 'a', type: 'quantitative'}
          }
        });
        assert.equal(model.encoding.shape, undefined);
        assert.equal(localLogger.warns[0], log.message.incompatibleChannel(SHAPE, BAR));
      })
    );

    it(
      'should drop invalid channel and throws warning',
      log.wrap(localLogger => {
        const _model = parseUnitModel({
          mark: 'bar',
          encoding: {
            _y: {type: 'quantitative'}
          }
        } as any); // To make parseUnitModel accept the model with invalid encoding channel
        assert.equal(localLogger.warns[0], log.message.invalidEncodingChannel('_y'));
      })
    );

    it(
      'should drop channel without field and value and throws warning',
      log.wrap(localLogger => {
        const model = parseUnitModel({
          mark: 'bar',
          encoding: {
            x: {type: 'quantitative'}
          }
        });
        assert.equal(model.encoding.x, undefined);
        assert.equal(localLogger.warns[0], log.message.emptyFieldDef({type: QUANTITATIVE}, X));
      })
    );

    it(
      'should drop a fieldDef without field and value from the channel def list and throws warning',
      log.wrap(localLogger => {
        const model = parseUnitModel({
          mark: 'bar',
          encoding: {
            detail: [{field: 'a', type: 'ordinal'}, {type: 'quantitative'}]
          }
        });
        assert.deepEqual<FieldDef<string> | FieldDef<string>[]>(model.encoding.detail, [{field: 'a', type: 'ordinal'}]);
        assert.equal(localLogger.warns[0], log.message.emptyFieldDef({type: QUANTITATIVE}, DETAIL));
      })
    );
  });

  describe('initAxes', () => {
    it('should not include properties of non-VlOnlyAxisConfig in config.axis', () => {
      const model = parseUnitModel({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'ordinal'},
          y: {field: 'b', type: 'ordinal'}
        },
        config: {axis: {domainWidth: 123}}
      });

      assert.equal(model.axis(X)['domainWidth'], undefined);
    });

    it('it should have axis.offset = encode.x.axis.offset', () => {
      const model = parseUnitModel({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'ordinal', axis: {offset: 345}},
          y: {field: 'b', type: 'ordinal'}
        }
      });

      assert.equal(model.axis(X).offset, 345);
    });
  });
});
