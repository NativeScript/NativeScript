using System;
using System.Numerics;
using Windows.UI;
using Windows.UI.Composition;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Hosting;

namespace NativeScript.Widgets
{
    public sealed class CompositionBorderHelper
    {
        private readonly UIElement _element;
        private readonly Visual _rootVisual;
        private readonly ContainerVisual _container;
        private readonly SpriteVisual _left, _top, _right, _bottom;
        private readonly CompositionColorBrush _leftBrush, _topBrush, _rightBrush, _bottomBrush;
        private CompositionRoundedRectangleGeometry? _clipGeometry;
        private CompositionGeometricClip? _clip;

        private CompositionBorderHelper(UIElement element, Visual rootVisual, Compositor compositor)
        {
            _element = element;
            _rootVisual = rootVisual;

            _container = compositor.CreateContainerVisual();
            var sizeAnim = compositor.CreateExpressionAnimation("host.Size");
            sizeAnim.SetReferenceParameter("host", rootVisual);
            _container.StartAnimation("Size", sizeAnim);

            _leftBrush   = compositor.CreateColorBrush(Colors.Transparent);
            _topBrush    = compositor.CreateColorBrush(Colors.Transparent);
            _rightBrush  = compositor.CreateColorBrush(Colors.Transparent);
            _bottomBrush = compositor.CreateColorBrush(Colors.Transparent);

            _left   = compositor.CreateSpriteVisual(); _left.Brush   = _leftBrush;
            _top    = compositor.CreateSpriteVisual(); _top.Brush    = _topBrush;
            _right  = compositor.CreateSpriteVisual(); _right.Brush  = _rightBrush;
            _bottom = compositor.CreateSpriteVisual(); _bottom.Brush = _bottomBrush;

            _container.Children.InsertAtTop(_top);
            _container.Children.InsertAtTop(_bottom);
            _container.Children.InsertAtTop(_left);
            _container.Children.InsertAtTop(_right);

            ElementCompositionPreview.SetElementChildVisual(element, _container);
        }

        public static CompositionBorderHelper? Create(UIElement element)
        {
            try
            {
                var rootVisual = ElementCompositionPreview.GetElementVisual(element);
                return new CompositionBorderHelper(element, rootVisual, rootVisual.Compositor);
            }
            catch
            {
                return null;
            }
        }

        public void UpdateBorderWidth(double left, double top, double right, double bottom)
        {
            float lw = (float)left, tw = (float)top, rw = (float)right, bw = (float)bottom;

            Animate(_top,    "Offset", "Vector3(0, 0, 0)");
            Animate(_top,    "Size",   FormattableString.Invariant($"Vector2(host.Size.X, {tw})"));

            Animate(_bottom, "Offset", FormattableString.Invariant($"Vector3(0, host.Size.Y - {bw}, 0)"));
            Animate(_bottom, "Size",   FormattableString.Invariant($"Vector2(host.Size.X, {bw})"));

            Animate(_left,   "Offset", FormattableString.Invariant($"Vector3(0, {tw}, 0)"));
            Animate(_left,   "Size",   FormattableString.Invariant($"Vector2({lw}, host.Size.Y - {tw} - {bw})"));

            Animate(_right,  "Offset", FormattableString.Invariant($"Vector3(host.Size.X - {rw}, {tw}, 0)"));
            Animate(_right,  "Size",   FormattableString.Invariant($"Vector2({rw}, host.Size.Y - {tw} - {bw})"));
        }

        public void UpdateBorderColor(uint left, uint top, uint right, uint bottom)
        {
            _leftBrush.Color   = ArgbToColor(left);
            _topBrush.Color    = ArgbToColor(top);
            _rightBrush.Color  = ArgbToColor(right);
            _bottomBrush.Color = ArgbToColor(bottom);
        }

        public void UpdateBorderRadius(double tl, double tr, double br, double bl)
        {
            // CompositionRoundedRectangleGeometry uses a single CornerRadius for all corners.
            // Uniform radius (the common case) is exact. For mixed values, max is used so that
            // corners intended to be rounded are never left sharp.
            float r = (float)Math.Max(Math.Max(tl, tr), Math.Max(br, bl));

            if (r <= 0)
            {
                _container.Clip = null;
                _clipGeometry?.Dispose();
                _clip?.Dispose();
                _clipGeometry = null;
                _clip = null;
                return;
            }

            var compositor = _container.Compositor;

            if (_clipGeometry == null)
            {
                _clipGeometry = compositor.CreateRoundedRectangleGeometry();
                var sizeAnim = compositor.CreateExpressionAnimation("host.Size");
                sizeAnim.SetReferenceParameter("host", _rootVisual);
                _clipGeometry.StartAnimation("Size", sizeAnim);
                _clip = compositor.CreateGeometricClip(_clipGeometry);
                _container.Clip = _clip;
            }

            _clipGeometry.CornerRadius = new Vector2(r);
        }

        public void Free()
        {
            try { ElementCompositionPreview.SetElementChildVisual(_element, null!); } catch { }
            _left.Dispose(); _top.Dispose(); _right.Dispose(); _bottom.Dispose();
            _leftBrush.Dispose(); _topBrush.Dispose(); _rightBrush.Dispose(); _bottomBrush.Dispose();
            _clipGeometry?.Dispose();
            _clip?.Dispose();
            _container.Dispose();
        }

        private void Animate(CompositionObject target, string property, string expression)
        {
            var anim = _container.Compositor.CreateExpressionAnimation(expression);
            anim.SetReferenceParameter("host", _rootVisual);
            target.StartAnimation(property, anim);
        }

        private static Color ArgbToColor(uint argb) => Color.FromArgb(
            (byte)((argb >> 24) & 0xFF),
            (byte)((argb >> 16) & 0xFF),
            (byte)((argb >> 8)  & 0xFF),
            (byte)( argb        & 0xFF));
    }
}
