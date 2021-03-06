import {Config} from '../config';
import {Flag, keys} from '../util';
import {Encoding} from './../encoding';
import {GenericUnitSpec, NormalizedLayerSpec} from './../spec';
import {Orient} from './../vega.schema';
import {GenericCompositeMarkDef, makeCompositeAggregatePartFactory, PartsMixins} from './common';
import {ErrorBarCenter, ErrorBarExtent, errorBarParams} from './errorbar';

export const ERRORBAND: 'errorband' = 'errorband';
export type ErrorBand = typeof ERRORBAND;

export type ErrorBandPart = 'band' | 'borders';

const ERRORBAND_PART_INDEX: Flag<ErrorBandPart> = {
  band: 1,
  borders: 1
};

export const ERRORBAND_PARTS = keys(ERRORBAND_PART_INDEX);

export type ErrorBandPartsMixins = PartsMixins<ErrorBandPart>;

export interface ErrorBandConfig extends ErrorBandPartsMixins {
  /**
   * The center of the error band. Available options include:
   * - `"mean"`: the mean of the data points.
   * - `"median"`: the median of the data points.
   *
   * __Default value:__ `"mean"`.
   * @hide
   */

  // center is not needed right now but will be added back to the schema if future features require it.
  center?: ErrorBarCenter;

  /**
   * The extent of the band. Available options include:
   * - `"ci"`: Extend the band to the confidence interval of the mean.
   * - `"stderr"`: The size of band are set to the value of standard error, extending from the mean.
   * - `"stdev"`: The size of band are set to the value of standard deviation, extending from the mean.
   * - `"iqr"`: Extend the band to the q1 and q3.
   *
   * __Default value:__ `"stderr"`.
   */
  extent?: ErrorBarExtent;
}

export type ErrorBandDef = GenericCompositeMarkDef<ErrorBand> &
  ErrorBandConfig & {
    /**
     * Orientation of the error band. This is normally automatically determined, but can be specified when the orientation is ambiguous and cannot be automatically determined.
     */
    orient?: Orient;
  };

export interface ErrorBandConfigMixins {
  /**
   * ErrorBand Config
   */
  errorband?: ErrorBandConfig;
}

export function normalizeErrorBand(
  spec: GenericUnitSpec<Encoding<string>, ErrorBand | ErrorBandDef>,
  config: Config
): NormalizedLayerSpec {
  const {
    transform,
    continuousAxisChannelDef,
    continuousAxis,
    encodingWithoutContinuousAxis,
    markDef,
    outerSpec
  } = errorBarParams(spec, ERRORBAND, config);

  const makeErrorBandPart = makeCompositeAggregatePartFactory<ErrorBandPartsMixins>(
    markDef,
    continuousAxis,
    continuousAxisChannelDef,
    encodingWithoutContinuousAxis,
    config.errorband
  );

  const is2D = spec.encoding.x !== undefined && spec.encoding.y !== undefined;
  const bandMark = is2D ? 'area' : 'rect';
  const bordersMark = is2D ? 'line' : 'rule';

  return {
    ...outerSpec,
    transform,
    layer: [
      ...makeErrorBandPart('band', bandMark, 'lower', 'upper'),
      ...makeErrorBandPart('borders', bordersMark, 'lower'),
      ...makeErrorBandPart('borders', bordersMark, 'upper')
    ]
  };
}
