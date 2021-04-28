import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon';

type ToolIds = 'location';

type Tool = {
  id: ToolIds;
  // eslint-disable-next-line @typescript-eslint/ban-types
  icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>;
};

export default Tool;
